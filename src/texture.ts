import { LoadingManager, Texture, TextureLoader } from "three";

interface TextureItem {
    name: string,
    texture: Texture
}

class TextureManager {

    private static list: Array<TextureItem> = new Array();
    private static textureLoader: TextureLoader = new TextureLoader();

    static setLoadingManager(manager: LoadingManager) {
        this.textureLoader.manager = manager;
    }

    static async loadTexture({ name, url }: { [key: string]: string }): Promise<void> {
        if (this.list.some(texture => texture.name == name)) throw new Error('Duplicate texture name.');
        const texture = await this.textureLoader.loadAsync(url);
        this.list.push({ name, texture });
    }

    static getTexture(name: string): Texture {
        if (!this.list.some(texture => texture.name == name)) throw new Error(`Texture ${name} not found.`);
        return this.list.find(texture => texture.name == name)!.texture;
    }

    static cloneTexture(name: string): Texture {
        const texture: Texture = this.getTexture(name);
        return texture.clone();
    }

}

export { TextureManager };