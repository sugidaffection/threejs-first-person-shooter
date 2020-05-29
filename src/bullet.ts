import { Body, Sphere, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from 'three';
import { Player } from './player';

export class Bullet extends Object3D {

  static world: World;
  static scene: Scene;
  static bullets: Bullet[] = [];

  body: Body;

  constructor(owner: Player, velocity: Vec3){
    super()
    this.name = owner.uuid;

    const mesh = new Mesh(
      new SphereGeometry(.1),
      new MeshBasicMaterial({color: 0x000000})
    );
    this.add(mesh);
    Bullet.scene.add(this);

    const shape = new Sphere(.1);
    this.body = new Body({shape: shape, mass: .1});
    this.body.velocity = velocity;

    const position = new Vec3(
      -1 * Math.sin(owner.quaternion.y) + owner.position.x,
      owner.position.y,
      -1 * Math.cos(owner.quaternion.y) + owner.position.z
    );
    this.body.position.copy(position);
    Bullet.world.addBody(this.body);
  }

  public static create(owner: Player, velocity: Vec3): void {
    Bullet.bullets.push(
      new Bullet(owner, velocity)
    )
  }

  public static update(): void {
    Bullet.bullets.forEach(
      bullet => {
        bullet.position.fromArray(bullet.body.position.toArray());
      }
    )
  }

}