import { Body, Sphere, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from 'three';

export class Bullet extends Object3D {

  static world: World;
  static scene: Scene;
  static bullets: Bullet[] = [];

  body: Body;
  interval: number = 3;

  constructor(owner: string, position: Vec3, velocity: Vec3){
    super()
    this.name = owner;

    const mesh = new Mesh(
      new SphereGeometry(.03, 32, 32),
      new MeshBasicMaterial({color: 0x000000})
    );
    this.add(mesh);
    Bullet.scene.add(this);

    const shape = new Sphere(.03);
    this.body = new Body({shape: shape, mass: .3});
    this.body.velocity = velocity;
    this.body.position.copy(position);
    Bullet.world.addBody(this.body);
    this.position.fromArray(position.toArray());
  }

  public static create(owner: string, position: Vec3, velocity: Vec3): void {
    Bullet.bullets.push(
      new Bullet(owner, position, velocity)
    );
  }

  public static update(dt: number): void {

    for(const bullet of Bullet.bullets) {
      bullet.position.fromArray(bullet.body.position.toArray());
    }

    for(const bullet of Bullet.bullets) {
      if(bullet.interval >= 0) {
        bullet.interval -= dt;
      }else{
        Bullet.destroy(bullet);
      }
    }
  }

  public static destroy(bullet: Bullet): void {
    Bullet.world.removeBody(bullet.body);
    Bullet.scene.remove(bullet);
    
    const index = Bullet.bullets.indexOf(bullet);
    Bullet.bullets.splice(index, 1);
  }

}