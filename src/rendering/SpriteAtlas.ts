import { Assets, Texture, Spritesheet } from 'pixi.js';

/**
 * Handles professional loading and management of Sprite Sheets and Texture Atlases.
 */
export class SpriteAtlas {
    private static instance: SpriteAtlas;
    private sheets: Map<string, Spritesheet>;

    private constructor() {
        this.sheets = new Map();
    }

    public static getInstance(): SpriteAtlas {
        if (!SpriteAtlas.instance) {
            SpriteAtlas.instance = new SpriteAtlas();
        }
        return SpriteAtlas.instance;
    }

    /**
     * Loads a texture atlas using PIXI.Assets.
     * @param alias The name to reference the atlas as.
     * @param url The URL of the json/manifest file.
     */
    public async load(alias: string, url: string): Promise<Spritesheet> {
        if (this.sheets.has(alias)) {
            return this.sheets.get(alias)!;
        }

        const sheet = await Assets.load(url) as Spritesheet;
        this.sheets.set(alias, sheet);
        console.log(`SpriteAtlas: Loaded atlas "${alias}" from ${url}`);
        return sheet;
    }

    /**
     * Retrieves a texture from a loaded atlas.
     */
    public getTexture(alias: string, frame: string): Texture {
        const sheet = this.sheets.get(alias);
        if (!sheet) {
            throw new Error(`SpriteAtlas: Atlas "${alias}" not loaded.`);
        }
        return sheet.textures[frame];
    }
}
