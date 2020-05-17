import { Body, Material, NaiveBroadphase, Plane, Vec3, World } from 'cannon-es';
import { Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Quaternion, Scene, Vector3, WebGLRenderer } from 'three';
// import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Player } from './player';


export class Game {

  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private world: World;

  private player: Player;
  private plane: object;
  private keyboard = {};

  constructor(width: number, height: number){
   this.scene = new Scene();
   this.renderer = new WebGLRenderer();
   this.camera = new PerspectiveCamera(75, width / height, .1, 1000);
   this.renderer.setSize(width, height);
   this.renderer.setPixelRatio(.5);

   this.camera.position.setZ(10);

   this.setupKeyboard();
   this.setupPhysisc();
   this.setup();
   this.update(() => {

    this.player.update();
    this.player.event(this.keyboard);

   });
  }

  keyEvent(event: KeyboardEvent): void {
    this.keyboard[event.code] = event.type === 'keydown';
  }

  setupKeyboard(): void {
    document.onkeydown = (e) => this.keyEvent(e);
    document.onkeyup = (e) => this.keyEvent(e);
  }

  setupPhysisc(): void {
    this.world = new World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new NaiveBroadphase();
  }

  setup(): void {
    this.player = new Player(this.renderer, this.scene, this.world);
    const planeMesh = new Mesh(
      new PlaneGeometry(10, 10, 1, 1),
      new MeshBasicMaterial({wireframe: true})
    );

    const planeMaterial = new Material();
    const planeShape = new Plane();
    const planeBody = new Body({mass: 0, shape: planeShape, material: planeMaterial});
    planeBody.position.y -= 3;
    planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planeMesh.quaternion.copy(planeBody.quaternion as unknown as Quaternion);
    planeMesh.position.copy(planeBody.position as unknown as Vector3);

    this.plane = {
      body: planeBody,
      mesh: planeMesh
    };

    this.world.addBody(planeBody);
    this.scene.add(planeMesh);
  }

  fixedUpdate(): void{
    this.world.step(1 / 60);
    this.renderer.render(this.scene, this.camera);
  }

  update(callback: () => void): void{
    this.fixedUpdate();

    callback();
    requestAnimationFrame(() => this.update(callback));
  }

  get domElement(): HTMLCanvasElement{
    return this.renderer.domElement;
  }

}
