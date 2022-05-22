import { Body, Sphere, Vec3, World } from 'cannon-es';
import { Euler, Mesh, MeshBasicMaterial, Object3D, Quaternion, Scene, SphereGeometry, Vector3 } from 'three';

export class Bullet extends Object3D {

  static world: World;
  static scene: Scene;
  static bullets: Bullet[] = [];

  body?: Body;
  range: number = 10;
  private collide: boolean = false;
  private spawnPosition: Vector3;

  private speed: number;

  constructor(owner: string, position: Vector3, quat: Quaternion, speed: number) {
    super()
    this.name = owner;

    const mesh = new Mesh(
      new SphereGeometry(.01),
      new MeshBasicMaterial({ color: 0xF00000 })
    );
    this.add(mesh);
    this.speed = speed;
    Bullet.scene.add(this);

    // const shape = new Sphere(.03);
    // this.body = new Body({shape: shape, mass: .1});
    // this.body.velocity = velocity;
    // this.body.position.copy(position);
    this.position.copy(position);
    this.spawnPosition = new Vector3().copy(this.position);
    // Bullet.world.addBody(this.body);
    this.quaternion.copy(quat);

  }

  get isCollide(): boolean {
    return this.collide;
  }

  setCollide(value: boolean): void {
    this.collide = value;
  }

  update(dt: number) {

    this.translateZ(-this.speed * dt);
    const distance = this.position.distanceTo(this.spawnPosition);
    if (distance > this.range || this.isCollide) {
      Bullet.destroy(this);
    }
  }

  public static create(owner: string, position: Vector3, quat: Quaternion, speed: number): void {
    const bullet = new Bullet(owner, position, quat, speed);
    Bullet.bullets.push(bullet);

    // bullet.body.addEventListener('collide', () => {
    //   bullet.setCollide(true);
    // });
  }

  public static update(dt: number): void {

    for (const bullet of Bullet.bullets) {
      // bullet.position.fromArray(bullet.body.position.toArray());
      bullet.update(dt);
    }
  }

  public static destroy(bullet: Bullet): void {
    // Bullet.world.removeBody(bullet.body);
    Bullet.scene.remove(bullet);

    const index = Bullet.bullets.indexOf(bullet);
    Bullet.bullets.splice(index, 1);
  }

}