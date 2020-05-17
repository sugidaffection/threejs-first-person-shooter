import { World } from 'cannon-es';
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,


  PlaneGeometry, Scene,
  WebGLRenderer
} from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';


export class Game {

  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private world: World;
  private css3d: CSS3DRenderer;

  constructor(width: number, height: number){
   this.scene = new Scene();
   this.renderer = new WebGLRenderer();
   this.camera = new PerspectiveCamera(75, width / height, .1, 1000);
   this.renderer.setSize(width, height);
   this.renderer.setPixelRatio(.5);

   this.camera.position.setZ(10);

   this.setupPhysisc();
   this.setup();
   this.update(() => {});
  }

  setupPhysisc(): void {
    this.world = new World();
  }

  setup(): void {
    const box = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({color: 0xFFFFFF})
    );

    const plane = new Mesh(
      new PlaneGeometry(1, 1, 1, 1),
      new MeshBasicMaterial({wireframe: true})
    );

    this.scene.add(box);
    this.scene.add(plane);
  }

  fixedUpdate(): void{
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
