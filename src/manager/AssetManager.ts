import { audioManager, AudioManager } from "./AudioManager";
import { textureManager, TextureManager } from "./TextureManager";
import { weaponManager, WeaponManager } from "./WeaponManager";
import { BaseLoadingManager, SingletonFn } from "./Manager";
import { Object3D, Texture } from "three";

export class AssetManager extends BaseLoadingManager {

    private loadedData?: any = {};
    audioManager: AudioManager;
    textureManager: TextureManager;
    weaponManager: WeaponManager;

    constructor(
    ) {
        super();
        this.audioManager = audioManager.getInstance();
        this.textureManager = textureManager.getInstance();
        this.weaponManager = weaponManager.getInstance();
    }

    set onLoad(f: any) {
        this._onLoad = f;
        this.audioManager.onLoad = this._onLoadHandler.bind(this);
        this.textureManager.onLoad = this._onLoadHandler.bind(this);
        this.weaponManager.onLoad = this._onLoadHandler.bind(this);
    }

    private _onLoadHandler(total: number, loaded: number, percentage: number): void {
        this.loadedData[total] = loaded;
        const t = Object.keys(this.loadedData).map(k => Number.parseFloat(k)).reduce((p, c) => p + c);
        const v = Object.values<string>(this.loadedData).map((v) => Number.parseFloat(v)).reduce((p, c) => p + c);
        if (this._onLoad)
            this._onLoad(t, v, Math.ceil(v / t * 100))
    }

    async loadAllAsset() {
        await Promise.all([
            this.audioManager.loadAudio({ name: 'music', url: '/assets/sound/music.mp3' }),
            this.audioManager.loadAudio({ name: 'fire', url: '/assets/sound/fire.wav' }),
            this.audioManager.loadAudio({ name: 'footstep', url: '/assets/sound/footstep.wav' }),
            this.audioManager.loadAudio({ name: 'reload', url: '/assets/sound/reload.mp3' }),

            this.textureManager.loadTexture({ name: 'sky', url: '/assets/sky.jpg' }),
            this.textureManager.loadTexture({ name: 'skybox', url: '/assets/skybox.png' }),
            this.textureManager.loadTexture({ name: 'floor', url: '/assets/floor.jpg' }),
            this.textureManager.loadTexture({ name: 'metal', url: '/assets/metal.jpg' }),
            this.textureManager.loadTexture({ name: 'flare', url: '/assets/flare.png' }),
            this.textureManager.loadTexture({ name: 'circle', url: '/assets/circle.jpg' }),

            this.weaponManager.loadWeapon({ name: 'ump47', materialURL: '/assets/ump47.mtl', objURL: '/assets/ump47.obj' }),
            this.weaponManager.loadWeapon({ name: 'kriss', objURL: '/assets/kriss.obj' })
        ])
    }

}

export class assetManager extends SingletonFn(AssetManager) {
    static getWeapon(name: string): Object3D {
        return this.getInstance().weaponManager.getWeapon(name);
    }

    static getAudioBuffer(name: string): AudioBuffer {
        return this.getInstance().audioManager.getAudioBuffer(name);
    }

    static getTexture(name: string): Texture {
        return this.getInstance().textureManager.getTexture(name);
    }
};