import { Body, Box as BoxShape, Quaternion, Vec3 } from 'cannon-es';
import { BoxGeometry, DoubleSide, Mesh, MeshPhongMaterial, Object3D, Texture } from 'three';

export class Box extends Object3D {

  body: Body;
  isMoving: boolean = false;
  zeroVelocity: boolean = false;

  constructor(position: Vec3, texture: Texture, quaternion?: Quaternion, velocity?: Vec3) {
    super();

    const mesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshPhongMaterial({map: texture, shadowSide: DoubleSide})
    );

    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
    const shape = new BoxShape(new Vec3(.5, .5, .5));
    const body = new Body({shape, mass: 1});
    body.position.copy(position);
    body.linearDamping = .9;
    body.quaternion = quaternion || body.quaternion;
    body.velocity = velocity || body.velocity;
    this.body = body;
    this.position.fromArray(body.position.toArray());
    this.add(mesh);
  }

  update(): void {
    if(this.zeroVelocity) this.body.velocity.setZero();
    const velocity = this.body.velocity.clone();
          velocity.y = 0;
    this.isMoving = velocity.almostZero(1)
    this.position.fromArray(this.body.position.toArray());
    this.quaternion.fromArray(this.body.quaternion.toArray());
  }
}