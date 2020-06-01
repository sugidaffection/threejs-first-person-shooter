import { Body, Sphere } from 'cannon-es';
import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Object3D } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class Player extends Object3D {

  body!: Body;
  gun!: Group;

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

    const mtlLoader = new MTLLoader();
    mtlLoader.load('/assets/ump47.mtl', (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.load('/assets/ump47.obj', (object) => {
        object.position.z -= .4;
        object.position.x += .4;
        object.position.y -= .15;
        object.rotation.y = Math.PI / 2;
        object.scale.set(.05, .05, .05);
        this.add(object);
        this.gun = object;
      })
    })

    this.add(mesh);

    const shape = new Sphere(.5);
    this.body = new Body({shape, mass: 5});
    this.body.linearDamping = .9;
  }

  update(): void {
    this.position.fromArray(this.body.position.toArray());
    if(this.gun){
      this.gun.rotation.x = this.body.quaternion.x;
    }
    
    if(this.body.position.y < -20){
      this.body.position.y = 5;
      this.body.position.x = 0;
      this.body.position.z = 0;
      this.body.velocity.setZero();
    }
  }
}