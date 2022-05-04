import { LoadingManager } from "three";
import { AudioManager } from "./AudioManager";
import { TextureManager } from "./TextureManager";
import { WeaponManager } from "./WeaponManager";

export class AssetManager {

    static manager: LoadingManager = new LoadingManager();

    static async loadAllAsset() {

        AudioManager.setLoadingManager(this.manager);
        TextureManager.setLoadingManager(this.manager);
        WeaponManager.setLoadingManager(this.manager);

        await Promise.all([
            AudioManager.addAudio({ name: 'music', url: '/assets/sound/music.mp3' }),
            AudioManager.addAudio({ name: 'fire', url: '/assets/sound/fire.wav' }),
            AudioManager.addAudio({ name: 'footstep', url: '/assets/sound/footstep.wav' }),
            AudioManager.addAudio({ name: 'reload', url: '/assets/sound/reload.mp3' }),

            TextureManager.loadTexture({ name: 'sky', url: 'assets/sky.jpg' }),
            TextureManager.loadTexture({ name: 'skybox', url: 'assets/skybox.png' }),
            TextureManager.loadTexture({ name: 'floor', url: 'assets/floor.jpg' }),
            TextureManager.loadTexture({ name: 'metal', url: 'assets/metal.jpg' }),
            TextureManager.loadTexture({ name: 'flare', url: 'assets/flare.png' }),
            TextureManager.loadTexture({ name: 'circle', url: 'assets/circle.jpg' }),

            WeaponManager.loadWeapon({ name: 'ump47', materialURL: '/assets/ump47.mtl', objURL: '/assets/ump47.obj' })
        ])
    }
}