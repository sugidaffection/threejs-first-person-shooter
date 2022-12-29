import { ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { PCFSoftShadowMap, PerspectiveCamera, WebGLRenderer } from 'three';
import { GameEvent } from './events/GameEvent';
import { AssetManager } from './manager/AssetManager';
import { LoadingScreen } from './screens/LoadingScreen';
import { sceneManager, SceneManager } from './manager/SceneManager';
import { Input } from './inputs/Input';
import { FirstPersonCamera } from './cameras/FirstPersonCamera';
import { rendererManager, RendererManager } from './manager/RendererManager';
import { SingletonFn } from './manager/Manager';

const [WIDTH, HEIGHT] = [640, 480];

const getCanvas = document.querySelector('canvas') || (() => {
  const canvas = document.createElement('canvas');
  document.querySelector('main')?.append(canvas);
  return canvas;
})()

class App extends GameEvent {
  private world: World = new World();
  private readonly canvas: HTMLElement = getCanvas;
  private readonly camera: PerspectiveCamera;
  private readonly rendererManager: RendererManager;
  private readonly sceneManager: SceneManager;
  constructor(
  ) {
    super();
    this.rendererManager = rendererManager.getInstance();
    this.sceneManager = sceneManager.getInstance();
    this.canvas.addEventListener('click', async () => {
      // await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });
    addEventListener('pointerlockchange', (e) => {
      Input.getInstance().setPointerLock(document.pointerLockElement == this.canvas);
    })

    let mainRenderer = new WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.rendererManager.addRenderer('main', mainRenderer);
    let renderer2 = new WebGLRenderer({ antialias: true });
    document.querySelector('.wrapper')?.appendChild(renderer2.domElement);
    this.rendererManager.addRenderer('renderer2', renderer2);
    this.setupRenderer();

    this.camera = new FirstPersonCamera();
    this.camera.name = 'world-cam';
    this.camera.position.y = 2;
    this.camera.position.z = 3;

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

  setupRenderer(): void {
    this.rendererManager.getAll().forEach(renderer => {
      renderer.setClearColor(0xffffff);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = PCFSoftShadowMap;
      let aspectRatio = renderer.domElement.width / renderer.domElement.height;
      renderer.setPixelRatio(aspectRatio);
    })
  }

  startLoop(): void {
    let renderer = this.rendererManager.get('main');
    if (renderer)
      renderer.setAnimationLoop(() => {
        this.update();
      });
  }

  setupWorld(): void {
    this.world = new World();

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
    let player = this.sceneManager.currentScene!.getObjectByName('player');
    this.camera.lookAt(player!.position);
    let renderer = this.rendererManager.get('renderer2');
    if (renderer)
      renderer.render(this.sceneManager.currentScene!, this.camera);
  }

}

class Main extends SingletonFn(App) {
  public static async main() {

    const loading = new LoadingScreen();
    const assetManager = new AssetManager();
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
};

export { Main };