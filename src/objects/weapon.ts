import { assetManager } from "../manager/AssetManager";
import { AudioListener, BoxGeometry, Mesh, MeshBasicMaterial, Object3D, PositionalAudio, Vector3 } from "three";
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
    protected leftAmmo: number;
    protected magazineSize: number;

    protected state: WeaponState;

    protected reloadTime: number;

    protected lt: number;

    constructor(audioListener: AudioListener) {
        super();

        this.fireRate = 0.4;
        this.fireSpeed = 3;

        this.currentAmmo = 30;
        this.maxAmmo = 30;
        this.leftAmmo = 100;
        this.magazineSize = 100;

        this.state = WeaponState.IDLE;

        this.reloadTime = 2;
        this.lt = 0;

        this.audioListener = audioListener;

        this.emitter = new Object3D();

        const geo = new BoxGeometry();
        const mat = new MeshBasicMaterial({ color: 0xFF0000 });
        const mesh = new Mesh(geo, mat);
        this.emitter.add(mesh);
        this.add(this.emitter);

        const fireAudioBuffer = assetManager.getAudioBuffer('fire');
        const positionalFireAudio = new PositionalAudio(this.audioListener);
        this.fireAudio = positionalFireAudio.setBuffer(fireAudioBuffer);
        this.add(this.fireAudio);

        const reloadAudioBuffer = assetManager.getAudioBuffer('reload');
        const positionalReloadAudio = new PositionalAudio(this.audioListener);
        this.reloadAudio = positionalReloadAudio.setBuffer(reloadAudioBuffer);
        this.add(this.reloadAudio);
    }

    getCurrentAmmo() {
        return this.currentAmmo;
    }

    getLeftAmmo() {
        return this.leftAmmo;
    }

    fire(direction: Vector3) {
        if (this.currentAmmo > 0 && this.state == WeaponState.IDLE) {
            if (this.lt > this.fireRate) {
                this.state = WeaponState.FIRE;

                Bullet.create(
                    this.uuid.toString(),
                    this.emitter.getWorldPosition(new Vector3()),
                    direction,
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
        if (this.state == WeaponState.IDLE && this.currentAmmo < this.maxAmmo && this.leftAmmo > 0) {
            this.lt = 0;
            this.state = WeaponState.RELOAD
            this.rotation.x = Math.PI / 4;
            this.playReloadAudio();
        }
    }

    fillAmmo() {
        const neededAmmo = this.maxAmmo - this.currentAmmo;
        const ammo = this.leftAmmo - neededAmmo > 0 ? neededAmmo : this.leftAmmo;
        this.currentAmmo += ammo;
        this.leftAmmo -= ammo;
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
        this.fireRate = 0.1;
        this.fireSpeed = 10;
        const object = assetManager.getWeapon('ump47');
        this.add(object);
        this.emitter.position.set(-1, 2.5, -1);
    }
}

export class Kriss extends Weapon {
    constructor(audioListener: AudioListener) {
        super(audioListener);
        this.fireRate = 0.1;
        this.fireSpeed = 10;
        const object = assetManager.getWeapon('kriss');
        this.add(object);
        this.emitter.position.set(4, 2.5, -1.7);
    }
}