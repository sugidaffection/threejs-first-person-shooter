import { ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { AudioListener } from 'three/src/audio/AudioListener';
import { Player } from './objects/player';
import { GameEvent } from './events/GameEvent';
import { AssetManager } from './manager/AssetManager';
import { GameScene } from './scenes/GameScene';
import { LoadingScreen } from './screens/LoadingScreen';
import { Controller } from './inputs/Controller';

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
  private readonly audioListener: AudioListener;
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly player: Player;
  private readonly controller: any;
  private readonly enemies: Player[] = [];

  constructor() {
    super();
    this.canvas.addEventListener('click', async () => {
      // await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });

    this.renderer = new WebGLRenderer({ antialias: false, canvas: this.canvas });
    this.camera = new PerspectiveCamera(75, WIDTH / HEIGHT, .1, 1000);
    this.audioListener = new AudioListener();
    this.scene = new GameScene();
    this.player = new Player(this.audioListener);
    this.player.setWeapon(AssetManager.getWeapon('ump47'));
    this.controller = new Controller(this.player, this.camera);
    this.scene.add(this.player);

    const enemy = new Player(this.audioListener);
    enemy.name = 'enemy'
    this.scene.add(enemy);

    this.setupRenderer();
    this.setupCamera();
    this.startLoop();
  }

  setupCamera(): void {
    this.camera.position.set(0, 0, 2);
    this.camera.rotation.set(0, .5, 0);
    this.updateCameraView(WIDTH, HEIGHT);
  }

  updateCameraView(width: number, height: number) {
    this.renderer.setSize(width, height);
    let aspectRatio = width / height;
    if (height > width) aspectRatio = height / width;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
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
    this.renderer.render(this.scene, this.camera);
    this.controller.update();
  }

  public static async main() {

    const loading = new LoadingScreen();
    const assetManager = new AssetManager();
    assetManager.onProgress = (url: string, loaded: number, total: number) => {
      loading.progress = Math.ceil(loaded / total * 100);
      loading.update();
    }
    assetManager.onLoad = () => {
    }

    assetManager.loadAllAsset().then(() => {
      console.log('loaded all assets');
      loading.destroy();

      this.getInstance();

    });
  }
}

export { Main };