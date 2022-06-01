import { ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { PCFSoftShadowMap, WebGLRenderer } from 'three';
import { GameEvent } from './events/GameEvent';
import { AssetManager } from './manager/AssetManager';
import { LoadingScreen } from './screens/LoadingScreen';
import { MouseInput } from './inputs/MouseInput';
import { SceneManager } from './manager/SceneManager';
import { Input } from './inputs/Input';

const [WIDTH, HEIGHT] = [640, 480];

const getCanvas = document.querySelector('canvas') || (() => {
  const canvas = document.createElement('canvas');
  document.querySelector('main')?.append(canvas);
  return canvas;
})()

class Main extends GameEvent {

  static getInstance(): Main {
    if (!this.instance) this.instance = new Main();
    return this.instance;
  }

  private static instance: Main;
  private readonly world: World = new World()
  private readonly canvas: HTMLElement = getCanvas;
  private readonly renderer: WebGLRenderer;
  private readonly sceneManager: SceneManager;
  constructor() {
    super();
    this.canvas.addEventListener('click', async () => {
      // await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });
    addEventListener('pointerlockchange', (e) => {
      Input.getInstance().setPointerLock(document.pointerLockElement == this.canvas);
    })

    this.renderer = new WebGLRenderer({ antialias: false, canvas: this.canvas });
    this.sceneManager = SceneManager.getInstance();
    this.sceneManager.setRenderer(this.renderer);
    this.setupRenderer();
    this.updateCameraView();

    // this.setUI();

    this.startLoop();
  }

  setUI() {
    const ammo = document.createElement('div');
    ammo.className = 'ammoPanel';
    ammo.textContent = '30'
    // this.ammoPanel = ammo;
    document.querySelector('main .wrapper')?.append(ammo);
  }

  updateCameraView() {
    let aspectRatio = WIDTH / HEIGHT;
    if (HEIGHT > WIDTH) aspectRatio = HEIGHT / WIDTH;
  }

  setupRenderer(): void {
    this.renderer.setClearColor(0xffffff);
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(WIDTH, HEIGHT);
    this.renderer.setPixelRatio(window.devicePixelRatio * .8);
  }

  startLoop(): void {
    this.renderer.setAnimationLoop(() => {
      this.update();
    });
  }

  setupWorld(): void {
    this.world.broadphase = new NaiveBroadphase();
    this.world.gravity = new Vec3(0, -20, 0);
    this.world.quatNormalizeSkip = 0;
    this.world.quatNormalizeFast = false;

    const solver = new GSSolver();
    this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;
    solver.iterations = 7;
    solver.tolerance = 0.1;
    this.world.solver = solver;

    const material = new Material();
    const cMaterial = new ContactMaterial(
      material,
      material,
      {
        friction: 0,
        restitution: .8
      }
    );
    this.world.addContactMaterial(cMaterial);
  }

  update(): void {
    this.sceneManager.update();
    this.input.update();
  }

  public static async main() {

    const loading = new LoadingScreen();
    const assetManager = AssetManager.getInstance();
    // assetManager.onProgress = (url: string, loaded: number, total: number) => {
    //   loading.progress = Math.ceil(loaded / total * 100);
    //   loading.update();
    // }

    assetManager.onLoad = (total, loaded, percentage) => {
      loading.progress = percentage;
      loading.update();
    }

    assetManager.loadAllAsset().then(() => {
      console.log('loaded all assets');
      loading.destroy();
      this.getInstance();
    });
  }
}

export { Main };