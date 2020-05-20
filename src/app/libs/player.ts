import { Body, Box, Material, Vec3, World } from 'cannon-es';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, WebGLRenderer } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

export class Player extends Object3D {

  private mesh: Mesh;
  private body: Body;
  private camera: PerspectiveCamera;

  private moveSpeed = 5.0;
  private jumpPower = 5.0;

  private playerId;

  controller = {
    left: 'KeyA',
    right: 'KeyD',
    forward: 'KeyW',
    backward: 'KeyS',
    jump: 'Space'
  };

  public controls: PointerLockControls;

  constructor(renderer: WebGLRenderer, world: World, color=0xFFFFFF) {
    super();

    this.mesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({color, wireframe: false})
    );

    this.add(this.mesh);

    const boxMaterial = new Material();
    const boxShape = new Box(new Vec3(.5, .5, .5));
    this.body = new Body({mass: 1, shape: boxShape, material: boxMaterial});
    world.addBody(this.body);

    const width = renderer.domElement.width;
    const height = renderer.domElement.height;

    this.camera = new PerspectiveCamera(75, width / height, .1, 1000);
    this.camera.position.setY(this.position.y + 2);

    this.controls = new PointerLockControls(this.camera, renderer.domElement);

    this.add(this.camera);

    this.camera.rotation.set(0, Math.PI, 0);

  }

  getBody(){
    return this.body;
  }

  setPosition(position) {
    this.position.set(position.x, position.y, position.z);
  }

  setRotation(rotation){
    this.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  toJSON(){
    return {
      id: this.playerId,
      position: this.position,
      rotation: this.rotation
    };
  }

  getPlayerId() {
    return this.playerId;
  }

  setPlayerId(id){
    this.name = id;
    this.playerId = id;
  }

  getCamera(){
    return this.camera;
  }

  update(dt): void{
    this.body.position.x = this.camera.position.x;
    this.body.position.z = this.camera.position.z;

    this.camera.position.y = this.body.position.y;

    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;
    this.position.z = this.body.position.z;

    this.rotation.copy(this.camera.rotation);
  }

  moveLeft(dt): void {
    this.controls.moveRight(-this.moveSpeed * dt);
  }

  moveRight(dt): void {
    this.controls.moveRight(this.moveSpeed * dt);
  }

  moveForward(dt): void {
    this.controls.moveForward(this.moveSpeed * dt);
  }

  moveBackward(dt): void {
    this.controls.moveForward(-this.moveSpeed * dt);
  }

  jump(dt): void {
    this.body.velocity.y = this.jumpPower;
  }

  public event(input, dt): void {
    if (input[this.controller.left]) {
      this.moveLeft(dt);
    }
    if (input[this.controller.right]) {
      this.moveRight(dt);
    }
    if (input[this.controller.forward]) {
      this.moveForward(dt);
    }
    if (input[this.controller.backward]) {
      this.moveBackward(dt);
    }
    if (input[this.controller.jump]) {
      this.jump(dt);
    }

  }

}
