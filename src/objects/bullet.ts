import { Body, Sphere, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, Object3D, Scene, SphereGeometry } from 'three';

export class Bullet extends Object3D {

  static world: World;
  static scene: Scene;
  static bullets: Bullet[] = [];

  body: Body;
  interval: number = 3;
  private collide: boolean = false;

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
    this.body = new Body({shape: shape, mass: .1});
    this.body.velocity = velocity;
    this.body.position.copy(position);
    this.position.fromArray(position.toArray());
    Bullet.world.addBody(this.body);

  }

  get isCollide(): boolean {
    return this.collide;
  }

  setCollide(value: boolean): void {
    this.collide = value;
  }

  public static create(owner: string, position: Vec3, velocity: Vec3): void {
    const bullet = new Bullet(owner, position, velocity);
    Bullet.bullets.push(bullet);

    bullet.body.addEventListener('collide', () => {
      bullet.setCollide(true);
    });
  }

  public static update(dt: number): void {

    for(const bullet of Bullet.bullets) {
      bullet.position.fromArray(bullet.body.position.toArray());
    }

    for(const bullet of Bullet.bullets) {
      if(bullet.interval >= 0) {
        bullet.interval -= dt;
      }
      if(bullet.interval < 0 || bullet.isCollide ){
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