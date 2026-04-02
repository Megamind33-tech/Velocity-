import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

const btnStyle = new TextStyle({
    fill: '#00ffcc',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Orbitron, Arial',
});

/**
 * Post-run summary: complete or crash, with retry and return-to-map actions.
 */
export class RunResultOverlay extends Container {
    constructor(
        app: Application,
        title: string,
        subtitle: string,
        onRetry: () => void,
        onMap: () => void
    ) {
        super();

        const dim = new Graphics();
        dim.rect(0, 0, app.screen.width, app.screen.height);
        dim.fill({ color: 0x000011, alpha: 0.88 });
        dim.eventMode = 'static';
        this.addChild(dim);

        const titleText = new Text({
            text: title,
            style: new TextStyle({ ...btnStyle, fontSize: 28 }),
        });
        titleText.anchor.set(0.5);
        titleText.position.set(app.screen.width / 2, app.screen.height / 2 - 70);
        this.addChild(titleText);

        const sub = new Text({
            text: subtitle,
            style: new TextStyle({ fill: '#aabbcc', fontSize: 14, fontFamily: 'system-ui, sans-serif' }),
        });
        sub.anchor.set(0.5);
        sub.position.set(app.screen.width / 2, app.screen.height / 2 - 28);
        this.addChild(sub);

        const retry = this.makeButton('RETRY', onRetry);
        retry.position.set(app.screen.width / 2 - 120, app.screen.height / 2 + 30);
        const mapBtn = this.makeButton('MAP', onMap);
        mapBtn.position.set(app.screen.width / 2 + 20, app.screen.height / 2 + 30);
        this.addChild(retry, mapBtn);
    }

    private makeButton(label: string, onClick: () => void): Container {
        const c = new Container();
        c.eventMode = 'static';
        c.cursor = 'pointer';
        const bg = new Graphics();
        bg.roundRect(0, 0, 100, 44, 8);
        bg.fill({ color: 0x111122, alpha: 0.95 });
        bg.stroke({ color: 0x00ffcc, width: 2 });
        const t = new Text({ text: label, style: btnStyle });
        t.anchor.set(0.5);
        t.position.set(50, 22);
        c.addChild(bg, t);
        c.on('pointerdown', (e) => {
            e.stopPropagation();
            onClick();
        });
        return c;
    }
}
