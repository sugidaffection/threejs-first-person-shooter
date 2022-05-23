import { Event, LoadingManager, Object3D, Texture } from "three";
import { AudioManager } from "./AudioManager";
import { TextureManager } from "./TextureManager";
import { WeaponManager } from "./WeaponManager";
import { BaseManager } from "./Manager";

export class AssetManager extends BaseManager<AssetManager>() {

    static instance = new AssetManager();

    static getAudioBuffer(name: string): AudioBuffer {
        return this.getInstance().audioManager.getAudioBuffer(name);
    }

    static getWeapon(name: string): Object3D<Event> {
        return this.getInstance().weaponManager.cloneWeapon(name);
    }

    static getTexture(name: string): Texture {
        return this.getInstance().textureManager.cloneTexture(name);
    }

    private audioManager: AudioManager;
    private textureManager: TextureManager;
    private weaponManager: WeaponManager;

    private loadedData?: any = {};

    protected constructor() {
        super();
        this.audioManager = new AudioManager();
        this.textureManager = new TextureManager();
        this.weaponManager = new WeaponManager();
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