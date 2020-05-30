import { Body, Sphere, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from 'three';

export class Bullet extends Object3D {

  static world: World;
  static scene: Scene;
  static bullets: Bullet[] = [];

  body: Body;

  constructor(owner: string, position: Vec3, velocity: Vec3){
    super()
    this.name = owner;

    const mesh = new Mesh(
      new SphereGeometry(.1, 32, 32),
      new MeshBasicMaterial({color: 0x000000})
    );
    this.add(mesh);
    Bullet.scene.add(this);

    const shape = new Sphere(.1);
    this.body = new Body({shape: shape, mass: 1});
    this.body.velocity = velocity;
    this.body.position.copy(position);
    Bullet.world.addBody(this.body);
  }

  public static create(owner: string, position: Vec3, velocity: Vec3): void {
    Bullet.bullets.push(
      new Bullet(owner, position, velocity)
    );
  }

  public static update(): void {
    Bullet.bullets.forEach(
      bullet => {
        bullet.position.fromArray(bullet.body.position.toArray());
      }
    )
  }

}