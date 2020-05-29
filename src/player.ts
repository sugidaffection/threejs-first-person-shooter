import { Body, Box, Vec3 } from 'cannon-es';
import { BoxGeometry, Mesh, MeshPhongMaterial, Object3D } from 'three';

export class Player extends Object3D {

  body!: Body;


  constructor() {
    super();
    this.setup();
  }

  setup(): void {
    const mesh = new Mesh(
      new BoxGeometry(.5, 1, .5),
      new MeshPhongMaterial({color: 0xff0000})
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(mesh);

    const shape = new Box(new Vec3(.25, .5, .25));
    this.body = new Body({shape, mass: 1});
    this.body.position.set(0, 5, 3);
    this.body.angularDamping = 1;
  }

  update(): void {
    this.position.fromArray(this.body.position.toArray());
    
    if(this.body.position.y < -20){
      this.body.position.y = 5;
      this.body.position.x = 0;
      this.body.position.z = 0;
    }
  }
}