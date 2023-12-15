import { assetManager } from "../manager/AssetManager";
import {
  AudioListener,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PositionalAudio,
  Vector3,
} from "three";
import { Bullet } from "./bullet";

export enum WeaponState {
  IDLE,
  FIRE,
  RELOAD,
}

export interface Ammunition {
  ammoType: string;
  ammoCount: number;
}

export abstract class Ammunition {
  constructor(public ammoType: string, public ammoCount: number) {}
}

export class NineMillimeter extends Ammunition {
  constructor() {
    super("9mm", 30);
  }
}

export interface Magazine {
  capacity: number;
  ammo: Ammunition;
}

export abstract class Magazine {
  constructor(public capacity: number, public ammo: Ammunition) {
    if (ammo.ammoCount > capacity) {
      this.ammo.ammoCount = capacity;
    }
  }

  reload(remainingAmmo: Ammunition) {
    let spaceAvailable = this.capacity - this.ammo.ammoCount;
    if (remainingAmmo.ammoCount > spaceAvailable) {
      remainingAmmo.ammoCount -= spaceAvailable;
      this.ammo.ammoCount += spaceAvailable;
    } else {
      this.ammo.ammoCount += remainingAmmo.ammoCount;
      remainingAmmo.ammoCount = 0;
    }
  }
}

export class SMGMagazine extends Magazine {
  constructor() {
    super(40, new NineMillimeter());
  }
}

export class UMP47Magazine extends Magazine {
  constructor() {
    super(25, new NineMillimeter());
  }
}

export interface Weapon {
  name: string;
  fireRate: number;
  fireSpeed: number;
  magazine: Magazine;
  reload(ammo: Ammunition): void;
}

export class Weapon extends Object3D {
  protected emitter: Object3D;
  protected audioListener: AudioListener;
  protected fireAudio: PositionalAudio;
  protected reloadAudio: PositionalAudio;

  protected state: WeaponState;
  protected reloadTime: number;

  protected lt: number;

  currentMagazineCount: number;

  constructor(
    public name: string,
    public fireRate: number,
    public fireSpeed: number,
    public magazine: Magazine,
    audioListener: AudioListener
  ) {
    super();

    this.currentMagazineCount = this.magazine.ammo.ammoCount;
    this.state = WeaponState.IDLE;
    this.reloadTime = 2;
    this.lt = 0;

    this.audioListener = audioListener;

    this.emitter = new Object3D();

    const geo = new BoxGeometry();
    const mat = new MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new Mesh(geo, mat);
    this.emitter.add(mesh);
    this.add(this.emitter);

    const fireAudioBuffer = assetManager.getAudioBuffer("fire");
    const positionalFireAudio = new PositionalAudio(this.audioListener);
    this.fireAudio = positionalFireAudio.setBuffer(fireAudioBuffer);
    this.add(this.fireAudio);

    const reloadAudioBuffer = assetManager.getAudioBuffer("reload");
    const positionalReloadAudio = new PositionalAudio(this.audioListener);
    this.reloadAudio = positionalReloadAudio.setBuffer(reloadAudioBuffer);
    this.add(this.reloadAudio);
  }

  fire(direction: Vector3) {
    if (this.magazine.ammo.ammoCount > 0 && this.state == WeaponState.IDLE) {
      if (this.lt > this.fireRate) {
        this.state = WeaponState.FIRE;

        Bullet.create(
          this.uuid.toString(),
          this.emitter.getWorldPosition(new Vector3()),
          direction,
          this.fireSpeed
        );

        this.playFireAudio();

        this.magazine.ammo.ammoCount--;
        this.currentMagazineCount = this.magazine.ammo.ammoCount;

        this.state = WeaponState.IDLE;
        this.lt = 0;
      }
    }
  }

  reload(ammo: Ammunition) {
    if (
      this.state == WeaponState.IDLE &&
      this.currentMagazineCount < this.magazine.capacity
    ) {
      this.lt = 0;
      this.state = WeaponState.RELOAD;
      this.rotation.x = Math.PI / 4;
      this.playReloadAudio();
      this.magazine.reload(ammo);
    }
  }

  refillMagazine() {
    this.currentMagazineCount = this.magazine.ammo.ammoCount;
  }

  playFireAudio() {
    if (this.fireAudio.isPlaying) this.fireAudio.stop();
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
      this.refillMagazine();
    }
  }
}

export class UMP47 extends Weapon {
  remainingAmmoCount: number = 4;
  constructor(audioListener: AudioListener) {
    super("UMP47", 0.1, 10, new UMP47Magazine(), audioListener);
    const object = assetManager.getWeapon("ump47");
    this.add(object);
    this.emitter.position.set(-1, 2.5, -1);
  }
}

export class Kriss extends Weapon {
  constructor(audioListener: AudioListener) {
    super("Kriss Vector", 0.1, 10, new SMGMagazine(), audioListener);
    const object = assetManager.getWeapon("kriss");
    this.add(object);
    this.emitter.position.set(4, 2.5, -1.7);
  }
}
