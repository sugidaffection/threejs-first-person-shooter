import { AssetManager } from "../manager/AssetManager";
import { AudioListener, Object3D, PositionalAudio, Quaternion, Vector3 } from "three";
import { Bullet } from "./bullet";

export enum WeaponState {
    IDLE,
    FIRE,
    RELOAD
}

export class Weapon extends Object3D {
    protected emitter: Object3D;
    protected audioListener: AudioListener;
    protected fireAudio: PositionalAudio;
    protected reloadAudio: PositionalAudio;

    protected fireRate: number;
    protected fireSpeed: number;

    protected currentAmmo: number;
    protected maxAmmo: number;
    protected ammoStorage: number;
    protected maxAmmoStorage: number;

    protected state: WeaponState;

    protected reloadTime: number;

    protected lt: number;

    constructor(audioListener: AudioListener) {
        super();

        this.fireRate = 0.75;
        this.fireSpeed = 0.8;

        this.currentAmmo = 30;
        this.maxAmmo = 30;
        this.ammoStorage = 100;
        this.maxAmmoStorage = 100;

        this.state = WeaponState.IDLE;

        this.reloadTime = 2;
        this.lt = 0;

        this.audioListener = audioListener;


        this.emitter = new Object3D();
        this.add(this.emitter);

        const fireAudioBuffer = AssetManager.getAudioBuffer('fire');
        const positionalFireAudio = new PositionalAudio(this.audioListener);
        this.fireAudio = positionalFireAudio.setBuffer(fireAudioBuffer);
        this.add(this.fireAudio);

        const reloadAudioBuffer = AssetManager.getAudioBuffer('reload');
        const positionalReloadAudio = new PositionalAudio(this.audioListener);
        this.reloadAudio = positionalReloadAudio.setBuffer(reloadAudioBuffer);
        this.add(this.reloadAudio);
    }

    getCurrentAmmo() {
        return this.currentAmmo;
    }

    getAmmoStorage() {
        return this.ammoStorage;
    }

    fire() {
        if (this.currentAmmo > 0 && this.state == WeaponState.IDLE) {
            if (this.lt > this.fireRate) {
                this.state = WeaponState.FIRE;
                const quat = this.parent!.getWorldQuaternion(new Quaternion());
                const position = this.emitter.getWorldPosition(new Vector3());

                Bullet.create(
                    this.uuid.toString(),
                    position,
                    quat,
                    this.fireSpeed
                );

                this.playFireAudio();

                this.currentAmmo--;

                this.state = WeaponState.IDLE;
                this.lt = 0;
            }
        }
    }

    reload() {
        if (this.state == WeaponState.IDLE && this.currentAmmo < this.maxAmmo && this.ammoStorage > 0) {
            this.lt = 0;
            this.state = WeaponState.RELOAD
            this.rotation.x = Math.PI / 4;
            this.playReloadAudio();
        }
    }

    fillAmmo() {
        const neededAmmo = this.maxAmmo - this.currentAmmo;
        const ammo = this.ammoStorage - neededAmmo > 0 ? neededAmmo : this.ammoStorage;
        this.currentAmmo += ammo;
        this.ammoStorage -= ammo;
    }

    playFireAudio() {
        if (this.fireAudio.isPlaying)
            this.fireAudio.stop();
        this.fireAudio.play();
    }

    playReloadAudio() {
        this.reloadAudio.play();
    }

    update(dt) {
        this.lt += dt;

        if (this.state == WeaponState.RELOAD && this.lt >= this.reloadTime) {
            this.state = WeaponState.IDLE;
            this.lt = 0;
            this.rotation.x = 0;
            this.fillAmmo();
        }
    }
}

export class UMP47 extends Weapon {
    constructor(audioListener: AudioListener) {
        super(audioListener);
        this.fireRate = 0.07;
        this.fireSpeed = 0.1;
        const object = AssetManager.getWeapon('ump47');
        this.add(object);
        this.emitter.position.set(4, 2.5, -1.7);
    }
}