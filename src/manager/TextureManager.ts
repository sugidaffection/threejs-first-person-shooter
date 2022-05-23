import { LoadingManager, Texture, TextureLoader } from "three";
import { BaseManager } from "./Manager";

interface TextureItem {
    name: string,
    texture: Texture
}

class TextureManager extends BaseManager<TextureManager>() {

    private list: Array<TextureItem>;
    private textureLoader: TextureLoader;

    constructor() {
        super();
        this.list = new Array<TextureItem>();
        this.textureLoader = new TextureLoader();
    }

    async loadTexture({ name, url }: { [key: string]: string }): Promise<string> {
        if (this.list.some(texture => texture.name == name))
            return Promise.reject(new Error('Duplicate texture name.'));
        const texture = await this.textureLoader.loadAsync(url, this.onLoadHandler.bind(this));
        if (!texture)
            return Promise.reject(new Error(`Failed to load texture ${name}`));
        this.list.push({ name, texture });

        return Promise.resolve(`Texture loaded ${name}`);
    }

    getTexture(name: string): Texture {
        if (!this.list.some(texture => texture.name == name)) throw new Error(`Texture ${name} not found.`);
        return this.list.find(texture => texture.name == name)!.texture;
    }

    cloneTexture(name: string): Texture {
        const texture: Texture = this.getTexture(name);
        return texture.clone();
    }

}

export { TextureManager };