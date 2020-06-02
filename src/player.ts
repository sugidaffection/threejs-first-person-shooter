import { Body, Sphere, Vec3 } from 'cannon-es';
import { AudioListener, BoxGeometry, Mesh, MeshPhongMaterial, Object3D, PositionalAudio, Vector3 } from 'three';
import { Bullet } from './bullet';

export class Player extends Object3D {

  body!: Body;
  walk: boolean = false;
  zoom: boolean = false;

  private readonly audioListener: AudioListener = new AudioListener();

  private ammo: number = 10;
  private maxAmmo: number = 10;
  private magazine: number = 10;

  private fireAudio?: PositionalAudio;
  private footstepAudio?: PositionalAudio;
  private reloadAudio?: PositionalAudio;
  private weapon?: Object3D;
  private isReloading: boolean = false;

  constructor() {
    super();
    this.setup();
  }

  private setup(): void {

    const mesh = new Mesh(
      new BoxGeometry(.5, 1, .5),
      new MeshPhongMaterial({color: 0xff0000})
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(mesh);

    const shape = new Sphere(.5);
    this.body = new Body({shape: shape, mass: 5, linearDamping: .9});

    this.add(this.audioListener);
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

  setWeapon(object: Object3D): void {
    object.position.z -= .4;
    object.position.x += .2;
    object.position.y -= .15;
    object.rotation.y = Math.PI / 2;
    object.scale.set(.05, .05, .05);

    this.add(object);
    this.weapon = object;
  }

  fire(): void {
    if (this.ammo > 0 && !this.isReloading) {
      const rotation = this.rotation;
      const position = new Vector3(
        .5 * -Math.sin(rotation.y) + this.position.x, 
        this.position.y, 
        .5 * -Math.cos(rotation.y) + this.position.z
      )
      const vel = new Vector3(
        10 * -Math.sin(rotation.y),
        0,
        10 * -Math.cos(rotation.y)
      )

      Bullet.create(
        this.uuid.toString(), 
        new Vec3(
          position.x,
          position.y,
          position.z
        ),
        new Vec3(
          vel.x,
          vel.y,
          vel.z
        )
      );

      if(this.fireAudio){
        if(this.fireAudio.isPlaying)
          this.fireAudio.stop();
        this.fireAudio.play();
      }
      this.ammo--;
    }
  }

  zoomIn(){
    if(this.weapon){
      this.weapon.position.x = .05;
    }
  }

  zoomOut(){
    if(this.weapon)
      this.weapon.position.x = .2;
  }

  reload(){
    if(!this.isReloading && this.ammo < this.maxAmmo && this.magazine > 0){
      const needAmmo = this.maxAmmo - this.ammo;
      const ammo = this.magazine - needAmmo > 0 ? needAmmo : this.magazine;
      this.ammo += ammo;
      this.magazine -= ammo;

      if(this.reloadAudio){
        this.reloadAudio.play();
      }
      this.isReloading = true;
    }
  }

  update(): void {
    this.position.fromArray(this.body.position.toArray());

    if(this.footstepAudio) {
      const velocity = this.body.velocity.clone();
      velocity.y = 0;
      if(!velocity.almostZero(1) && !this.footstepAudio.isPlaying)
        this.footstepAudio.play();
    }

    if(this.reloadAudio) {
      this.isReloading = this.reloadAudio.isPlaying;
    }

    if(this.body.position.y < -20){
      this.body.position.y = 5;
      this.body.position.x = 0;
      this.body.position.z = 0;
      this.body.velocity.setZero();
    }
  }
}