import { Body, Box, Material, Vec3, World } from 'cannon-es';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Scene, Vector3, WebGLRenderer } from 'three';

export class Player extends Object3D {

  private mesh: Mesh;
  private body: Body;

  controller = {
    left: 'KeyA',
    right: 'KeyD',
    forward: 'KeyW',
    backward: 'KeyS',
    jump: 'Space'
  };

  constructor(renderer: WebGLRenderer, scene: Scene, world: World) {
    super();

    this.mesh = new Mesh(
      new BoxGeometry(1, 2, 1),
      new MeshBasicMaterial({color: 0xFFFFFF, wireframe: true})
    );

    this.add(this.mesh);
    scene.add(this);

    const boxMaterial = new Material();
    const boxShape = new Box(new Vec3(.5, 1, .5));
    this.body = new Body({mass: .1, shape: boxShape, material: boxMaterial});
    world.addBody(this.body);
    var camera = scene.getObjectByName('camera');

    document.addEventListener('click', () => {
      this.body.position.set(10, 10, 0);
    });

  }

  update(): void{
    const bodyPosition: Vec3 = this.body.position;
    const position: Vector3 = new Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z);

    this.mesh.position.copy(position);
  }

  moveLeft(): void {
    this.body.position.x -= .1;
  }

  moveRight(): void {
    this.body.position.x += .1;
  }

  moveForward(): void {
    this.body.position.z -= .1;
  }

  moveBackward(): void {
    this.body.position.z += .1;
  }

  jump(): void {
    this.body.position.y += .1;
  }

  public event(keyboard): void {
    if (keyboard[this.controller.left]) {
      this.moveLeft();
    }
    if (keyboard[this.controller.right]) {
      this.moveRight();
    }
    if (keyboard[this.controller.forward]) {
      this.moveForward();
    }
    if (keyboard[this.controller.backward]) {
      this.moveBackward();
    }
    if (keyboard[this.controller.jump]) {
      this.jump();
    }
  }

}
