import {
  Body,
  Sphere,
  Vec3
} from 'cannon-es';
import {
  AudioListener,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  PositionalAudio,
  Vector3,
  Object3D,
  PerspectiveCamera,
  Euler,
  Clock,
  Quaternion,
  MeshBasicMaterial
} from 'three';
import {
  Bullet
} from './bullet';
import { AssetManager } from '../manager/AssetManager';
import { Controller } from 'src/inputs/Controller';

export interface PlayerJSON {
  id: string,
  pos: {
    x: number,
    y: number,
    z: number
  },
  rot: {
    x: number,
    y: number,
    z: number
  },
  vel: {
    x: number,
    y: number,
    z: number
  },
  isGrounded: boolean,
  ammo: number,
  magazine: number
}

export class Player extends Object3D {

  body!: Body;
  walk: boolean = false;
  zoom: boolean = false;
  isReloading: boolean = false;
  isGrounded: boolean = false;

  private audioListener: AudioListener;

  private ammo: number = 100;
  private maxAmmo: number = 100;
  private magazine: number = 30;
  private maxMagazine: number = 30;

  private bulletSpeed: number = 30;

  private fireAudio?: PositionalAudio;
  private footstepAudio?: PositionalAudio;
  private reloadAudio?: PositionalAudio;
  private weapon?: Object3D;

  private camera?: PerspectiveCamera;

  private hand: Object3D;
  private lt = 0;
  private bulletSpawner: Object3D;
  canFire: boolean = false;
  fireRate: number = .1;

  constructor(audioListener: AudioListener, color?: string, body?: boolean) {
    super();
    this.audioListener = audioListener;
    this.setFireAudio(AssetManager.getAudioBuffer('fire'));
    this.setFootstepAudio(AssetManager.getAudioBuffer('footstep'));
    this.setReloadAudio(AssetManager.getAudioBuffer('reload'));

    this.add(audioListener);
    this.hand = new Object3D();

    const mesh = new Mesh(
      new BoxGeometry(.3, .7, .3),
      new MeshPhongMaterial({
        color: color || 0xff0000
      })
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(mesh, this.hand);

    const shape = new Sphere(.4);
    if (body !== false) {
      this.body = new Body({
        shape: shape,
        mass: .5,
        linearDamping: .9
      });
      this.position.fromArray(this.body.position.toArray());
    }


    this.bulletSpawner = new Object3D();


    const ump47 = AssetManager.getWeapon('ump47');
    this.setWeapon(ump47);
  }

  setCamera(camera: PerspectiveCamera) {
    this.camera = camera;
    this.camera.rotation.set(0, 0, 0);
    this.camera.position.copy(this.position);
  }

  getCamera(): PerspectiveCamera | undefined {
    return this.camera;
  }

  toJSON() {
    return {
      id: this.name,
      pos: this.position,
      rot: this.rotation.toVector3(),
      vel: {
        x: this.body.velocity.x,
        y: this.body.velocity.y,
        z: this.body.velocity.z
      },
      isGrounded: this.isGrounded
    }
  }

  setFireAudio(audio: AudioBuffer): void {
    this.fireAudio = new PositionalAudio(this.audioListener).setBuffer(audio);
    this.add(this.fireAudio);
  }

  setFootstepAudio(audio: AudioBuffer): void {
    this.footstepAudio = new PositionalAudio(this.audioListener).setBuffer(audio);
    this.footstepAudio.setPlaybackRate(.5);
    this.add(this.footstepAudio);
  }

  setReloadAudio(audio: AudioBuffer): void {
    this.reloadAudio = new PositionalAudio(this.audioListener).setBuffer(audio);
    this.add(this.reloadAudio);
  }

  fillMagazine() {
    this.magazine = this.maxMagazine;
  }

  setWeapon(w: Object3D): void {
    w.rotation.y = Math.PI / 2;
    w.scale.set(.05, .05, .05);

    w.add(this.bulletSpawner);

    this.bulletSpawner.position.x = 4;
    this.bulletSpawner.position.y = 2.5;
    this.bulletSpawner.position.z = -1;

    const object = new Object3D();
    object.add(w)
    object.position.z -= .4;
    object.position.x += .2;
    object.position.y -= .16;

    if (this.weapon)
      this.hand.remove(this.weapon);
    this.hand.add(object);
    this.weapon = object;
  }

  rotateWeapon(euler: Euler) {
    this.hand.setRotationFromEuler(euler);
  }

  getWeapon(): Object3D {
    return this.weapon!;
  }

  setGround(value: boolean): void {
    this.isGrounded = value;
  }

  getAmmo(): number {
    return this.ammo;
  }

  getMagazine(): number {
    return this.magazine;
  }

  fire(): void {
    if (this.ammo > 0 && !this.isReloading && this.canFire) {
      const quat = this.weapon!.getWorldQuaternion(new Quaternion());
      const position = this.bulletSpawner!.getWorldPosition(new Vector3());

      Bullet.create(
        this.uuid.toString(),
        position,
        quat,
        this.bulletSpeed
      );

      if (this.fireAudio) {
        if (this.fireAudio.isPlaying)
          this.fireAudio.stop();
        this.fireAudio.play();
      }
      this.ammo--;

      this.canFire = false;
    }
  }

  zoomIn() {
    if (this.weapon && this.camera) {
      this.weapon.position.x = .0535;
      this.camera.zoom = 5;
      this.camera.updateProjectionMatrix();
    }
  }

  zoomOut() {
    if (this.weapon && this.camera) {
      this.weapon.position.x = .2;
      this.camera.zoom = 1;
      this.camera.updateProjectionMatrix();
    }
  }

  reload() {
    if (!this.isReloading && this.ammo < this.maxAmmo && this.magazine > 0) {
      const needAmmo = this.maxAmmo - this.ammo;
      const ammo = this.magazine - needAmmo > 0 ? needAmmo : this.magazine;
      this.ammo += ammo;
      this.magazine -= ammo;

      if (this.reloadAudio) {
        this.reloadAudio.play();
      }
      this.isReloading = true;
    }
  }

  updateFromJSON(data: PlayerJSON): void {
    this.body.position.set(data.pos.x, data.pos.y, data.pos.z);
    this.rotation.set(data.rot.x, data.rot.y, data.rot.z);
    this.body.velocity.set(data.vel.x, data.vel.y, data.vel.z);
    this.isGrounded = data.isGrounded;
  }

  update(dt): void {
    this.lt += dt;

    if (this.lt > this.fireRate && !this.canFire) {
      this.canFire = true;
      this.lt = 0;
    }
    // this.position.fromArray(this.body.position.toArray());

    if (this.footstepAudio) {
      const velocity = this.body.velocity.clone();
      velocity.y = 0;
      if (!velocity.almostZero(1)) {
        this.walk = true;
      } else {
        this.walk = false;
      }

      if (this.isGrounded && this.walk && !this.footstepAudio.isPlaying) {
        this.footstepAudio.play();
      }

      if (!this.isGrounded && this.footstepAudio.isPlaying) {
        this.walk = false;
        this.footstepAudio.stop();
      }
    }

    if (this.reloadAudio) {
      this.isReloading = this.reloadAudio.isPlaying;
    }

    if (this.weapon) {
      if (this.isReloading)
        this.weapon.rotation.x = Math.PI / 4;
      else
        this.weapon.rotation.x = 0;
    }

    // if (this.body.position.y < -20) {
    //   this.body.position.y = 5;
    //   this.body.position.x = 0;
    //   this.body.position.z = 0;
    //   this.body.velocity.setZero();
    // }
  }
}