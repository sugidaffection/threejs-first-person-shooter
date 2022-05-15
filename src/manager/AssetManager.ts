import { Event, LoadingManager, Object3D, Texture } from "three";
import { AudioManager } from "./AudioManager";
import { TextureManager } from "./TextureManager";
import { WeaponManager } from "./WeaponManager";

export class AssetManager extends LoadingManager {

    static instance: AssetManager;

    static getInstance(): AssetManager {
        if (!this.instance) throw new Error('No Instance');
        return this.instance;
    }

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

    onLoadProgress?: (event: ProgressEvent<EventTarget>) => void;

    constructor(
        onLoadProgress?: (event: ProgressEvent<EventTarget>) => void
    ) {
        super();
        if (onLoadProgress)
            this.onLoadProgress = onLoadProgress;
        this.audioManager = new AudioManager();
        this.audioManager.setLoadingManager(this);
        this.textureManager = new TextureManager();
        this.textureManager.setLoadingManager(this);
        this.weaponManager = new WeaponManager();
        this.weaponManager.setLoadingManager(this);

        this.audioManager.onLoadProgress = this.onLoadProgressHandler.bind(this);
        this.textureManager.onLoadProgress = this.onLoadProgressHandler.bind(this);
        this.weaponManager.onLoadProgress = this.onLoadProgressHandler.bind(this);

        AssetManager.instance = this;
    }

    onLoadProgressHandler(event: ProgressEvent<EventTarget>) {
        if (this.onLoadProgress)
            this.onLoadProgress(event);
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

            this.weaponManager.loadWeapon({ name: 'ump47', materialURL: '/assets/ump47.mtl', objURL: '/assets/ump47.obj' })
        ])
    }


}