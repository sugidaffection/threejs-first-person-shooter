import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';

class MainApp {
  private readonly scene: Scene = new Scene();
  private readonly renderer: WebGLRenderer = new WebGLRenderer();
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  private readonly canvas: HTMLElement = this.renderer.domElement;

  constructor() {
    this.setup();
    window.addEventListener('resize', () => this.resizeHandler());
    window.addEventListener('dblclick', () => this.canvas.requestFullscreen());
    window.addEventListener('click', () => this.canvas.requestPointerLock());
    this.renderer.setAnimationLoop.bind(this.update);
  }

  setup(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);
  }

  resizeHandler(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(): void{
    this.renderer.render(this.scene, this.camera);
  }

  public static main() {
    new MainApp();
  }
}

window.onload = () => MainApp.main()