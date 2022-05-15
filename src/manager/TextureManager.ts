import { LoadingManager, Texture, TextureLoader } from "three";

interface TextureItem {
    name: string,
    texture: Texture
}

class TextureManager {

    private list: Array<TextureItem>;
    private textureLoader: TextureLoader;

    onLoadProgress?: (event: ProgressEvent<EventTarget>) => void;

    constructor(
        onLoadProgress?: (event: ProgressEvent<EventTarget>) => void
    ) {
        this.list = new Array<TextureItem>();
        this.textureLoader = new TextureLoader();
        this.onLoadProgress = onLoadProgress;
    }

    onLoadProgressHandler(event: ProgressEvent<EventTarget>) {
        if (this.onLoadProgress)
            this.onLoadProgress(event);
    }

    setLoadingManager(manager: LoadingManager) {
        this.textureLoader.manager = manager;
    }

    async loadTexture({ name, url }: { [key: string]: string }): Promise<string> {
        if (this.list.some(texture => texture.name == name))
            return Promise.reject(new Error('Duplicate texture name.'));
        const texture = await this.textureLoader.loadAsync(url, this.onLoadProgressHandler);
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