import { Body, Sphere, Vec3 } from "cannon-es";
import {
  AudioListener,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  PositionalAudio,
  Object3D,
  PerspectiveCamera,
  Euler,
  Raycaster,
  Vector3,
  Intersection,
  Camera,
  BoxHelper,
} from "three";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";
import { assetManager } from "../manager/AssetManager";
import { cameraManager } from "../manager/CameraManager";
import { Ammunition, Kriss, UMP47, Weapon } from "./weapon";

export interface PlayerJSON {
  id: string;
  pos: {
    x: number;
    y: number;
    z: number;
  };
  rot: {
    x: number;
    y: number;
    z: number;
  };
  vel: {
    x: number;
    y: number;
    z: number;
  };
  isGrounded: boolean;
  ammo: number;
  magazine: number;
}

export enum PlayerState {
  IDLE,
  WALK,
  RUN,
  JUMP,
  CROUCH,
}

export class Player extends Object3D {
  body!: Body;
  walk: boolean = false;
  zoom: boolean = false;
  isReloading: boolean = false;
  isGrounded: boolean = false;

  private audioListener: AudioListener;

  private footstepAudio?: PositionalAudio;
  private weapon?: Weapon;

  private camera: Camera;
  private raycaster: Raycaster;

  private pBody: Object3D;
  private hand: Object3D;

  remainingAmmo: Ammunition = { ammoType: "", ammoCount: 100 } as Ammunition;

  constructor(audioListener: AudioListener, color?: string, body?: boolean) {
    super();
    this.audioListener = audioListener;
    this.camera = new FirstPersonCamera();
    this.raycaster = new Raycaster();

    this.add(this.audioListener);
    this.setFootstepAudio(assetManager.getAudioBuffer("footstep"));

    this.hand = new Object3D();
    this.pBody = new Object3D();

    const mesh = new Mesh(
      new BoxGeometry(0.3, 0.7, 0.3),
      new MeshPhongMaterial({
        color: color || 0xff0000,
      })
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.pBody.add(this.hand);

    let meshHelper = new BoxHelper(mesh);

    this.add(meshHelper, this.pBody);

    const shape = new Sphere(0.4);
    if (body !== false) {
      this.body = new Body({
        shape: shape,
        mass: 0.5,
        linearDamping: 0.9,
      });
      this.position.fromArray(this.body.position.toArray());
    }

    const ump47 = new UMP47(this.audioListener);
    // const kriss = new Kriss(this.audioListener);
    this.setWeapon(ump47);
  }

  getHand() {
    return this.hand;
  }

  getCamera(): Camera {
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
        z: this.body.velocity.z,
      },
      isGrounded: this.isGrounded,
    };
  }

  setFootstepAudio(audio: AudioBuffer): void {
    this.footstepAudio = new PositionalAudio(this.audioListener).setBuffer(
      audio
    );
    this.footstepAudio.setPlaybackRate(0.5);
    this.add(this.footstepAudio);
  }

  setWeapon(w: Weapon): void {
    // w.rotation.y = Math.PI / 2;
    w.scale.setScalar(0.05);
    w.position.set(0.2, -0.07, -0.37);

    if (this.weapon) this.hand.remove(w);
    this.hand.add(w);

    this.weapon = w;
  }

  rotateWeapon(euler: Euler) {
    this.pBody.setRotationFromEuler(euler);
  }

  getWeapon(): Weapon {
    return this.weapon!;
  }

  setGround(value: boolean): void {
    this.isGrounded = value;
  }

  fire(): void {
    let camera = cameraManager.getInstance().get("camera")!;
    let cameraPos = camera.getWorldPosition(new Vector3());
    let cameraDir = camera.getWorldDirection(new Vector3());

    this.raycaster.set(cameraPos, cameraDir);
    let intersects: Intersection[] = [];
    if (this.parent)
      intersects = this.raycaster.intersectObjects(this.parent?.children);
    // if (intersects.length > 0)
    this.weapon?.fire(cameraDir);
  }

  // zoomIn() {
  //   if (this.weapon && this.camera) {
  //     this.weapon.position.x = .0535;
  //     this.camera.zoom = 5;
  //     this.camera.updateProjectionMatrix();
  //   }
  // }

  // zoomOut() {
  //   if (this.weapon && this.camera) {
  //     this.weapon.position.x = .2;
  //     this.camera.zoom = 1;
  //     this.camera.updateProjectionMatrix();
  //   }
  // }

  reload() {
    if (this.remainingAmmo.ammoCount > 0)
      this.weapon?.reload(this.remainingAmmo);
  }

  updateFromJSON(data: PlayerJSON): void {
    this.body.position.set(data.pos.x, data.pos.y, data.pos.z);
    this.rotation.set(data.rot.x, data.rot.y, data.rot.z);
    this.body.velocity.set(data.vel.x, data.vel.y, data.vel.z);
    this.isGrounded = data.isGrounded;
  }

  update(dt): void {
    this.weapon?.update(dt);

    // this.position.fromArray(this.body.position.toArray());

    // if (this.footstepAudio) {
    //   const velocity = this.body.velocity.clone();
    //   velocity.y = 0;
    //   if (!velocity.almostZero(1)) {
    //     this.walk = true;
    //   } else {
    //     this.walk = false;
    //   }

    //   if (this.isGrounded && this.walk && !this.footstepAudio.isPlaying) {
    //     this.footstepAudio.play();
    //   }

    //   if (!this.isGrounded && this.footstepAudio.isPlaying) {
    //     this.walk = false;
    //     this.footstepAudio.stop();
    //   }
    // }

    // if (this.body.position.y < -20) {
    //   this.body.position.y = 5;
    //   this.body.position.x = 0;
    //   this.body.position.z = 0;
    //   this.body.velocity.setZero();
    // }
  }
}
