/**
 * Optional HTML5 Audio for a run session — duration drives level length when `Song.audioUrl` is set.
 */

const cache = new Map<string, HTMLAudioElement>();

function resolveUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
        return url;
    }
    const base = import.meta.env.BASE_URL ?? '/';
    const path = url.startsWith('/') ? url.slice(1) : url;
    const b = base.endsWith('/') ? base : `${base}/`;
    return `${b}${path}`;
}

export type RunSessionAudioHandle = {
    readonly element: HTMLAudioElement;
    dispose: () => void;
};

/**
 * Reuse one element per URL so repeated plays don’t leak Audio nodes.
 */
export async function prepareRunSessionAudio(audioUrl: string): Promise<RunSessionAudioHandle | null> {
    const full = resolveUrl(audioUrl);
    let el = cache.get(full);
    if (!el) {
        el = new Audio();
        el.preload = 'auto';
        el.src = full;
        cache.set(full, el);
    }

    try {
        await new Promise<void>((resolve, reject) => {
            const ok = () => {
                cleanup();
                resolve();
            };
            const err = () => {
                cleanup();
                reject(new Error('audio load error'));
            };
            const cleanup = () => {
                el!.removeEventListener('loadedmetadata', ok);
                el!.removeEventListener('canplaythrough', ok);
                el!.removeEventListener('error', err);
            };
            if (el!.readyState >= 1 && Number.isFinite(el!.duration) && el!.duration > 0) {
                resolve();
                return;
            }
            el!.addEventListener('loadedmetadata', ok, { once: true });
            el!.addEventListener('canplaythrough', ok, { once: true });
            el!.addEventListener('error', err, { once: true });
            el!.load();
        });
    } catch {
        return null;
    }

    const duration = el.duration;
    if (!Number.isFinite(duration) || duration <= 0.5) {
        return null;
    }

    el.pause();
    el.currentTime = 0;

    return {
        element: el,
        dispose: () => {
            el.pause();
            el.currentTime = 0;
        },
    };
}

export function playRunSessionAudio(el: HTMLAudioElement): void {
    void el.play().catch(() => {
        /* autoplay policy — mic gate usually unlocks audio on same gesture in some browsers */
    });
}

export function pauseRunSessionAudio(el: HTMLAudioElement): void {
    el.pause();
}
