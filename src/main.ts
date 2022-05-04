import { ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { CircleBufferGeometry, BufferGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Points, PointsMaterial, PositionalAudio, Vector3, WebGLRenderer, Float32BufferAttribute } from 'three';
import { AudioListener } from 'three/src/audio/AudioListener';
import { Player } from './objects/player';
import { AudioManager } from './manager/AudioManager';
import { TextureManager } from './manager/TextureManager';
import { GameEvent } from './events/GameEvent';
import { AssetManager } from './manager/AssetManager';
import { WeaponManager } from './manager/WeaponManager';
import { GameScene } from './scenes/GameScene';
import { SceneManager } from './manager/SceneManager';
import { LoadingScreen } from './screens/LoadingScreen';

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

  private readonly audioListener: AudioListener = new AudioListener();

  private ammoPoints: Mesh[] = [];
  private particles: { geo: BufferGeometry, pos: number[], vel: Vector3[] }[] = [];

  private player!: Player;
  private controller: any;
  private sceneManager: SceneManager;

  constructor() {
    super();
    const renderer: WebGLRenderer = new WebGLRenderer({ antialias: false, canvas: this.canvas });
    const camera: PerspectiveCamera = new PerspectiveCamera(75, WIDTH / HEIGHT, .1, 1000);
    camera.position.z += 1;
    this.sceneManager = new SceneManager(renderer, camera);
    let scene = new GameScene();
    this.sceneManager.loadScene(scene);
    this.canvas.addEventListener('click', async () => {
      await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });
    // document.addEventListener('pointerlockchange', () => {
    //   if (this.controller && this.player)
    //     this.controller.enabled = document.pointerLockElement == this.canvas
    // });

    this.setup();
  }

  inputEvent(e: KeyboardEvent | MouseEvent): void {
    super.inputEvent(e);
    // if (this.controller.enabled) {
    //   if (Controller.RELOAD) this.player.reload();
    //   if (Controller.FIRE) this.player.fire();
    // }
  }

  private mouseEvent(event: MouseEvent): void {
    // if (event.button == 0 && this.controller.enabled) {
    //   this.player.fire();
    // }

    // if (event.button == 2 && this.controller.enabled && !this.player.isReloading) {
    //   this.player.zoom = !this.player.zoom;
    //   if (this.player.zoom) {
    //     this.player.zoomIn();
    //     this.controller.lockY = true;
    //   }
    //   else {
    //     this.player.zoomOut();
    //     this.controller.lockY = false;
    //   }
    // }
  }

  async setup(): Promise<void> {

    // setup world
    // this.setupWorld();

    // setup renderer
    this.setupRenderer();

    // setup player;
    // this.player = this.createPlayer();
    // this.player.add(this.audioListener);

    // setup controller
    // this.controller = new PointerLockControls(this.camera, this.player.body);
    // this.scene.add(this.controller.getObject());

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

  setupRenderer(): void {

  }

  createPlayer(name?: string, body?: boolean): Player {
    const player = new Player(this.audioListener, name, '#fff', body);
    player.setWeapon(WeaponManager.cloneWeapon('ump47'));
    // this.scene.add(player);
    if (body !== false)
      this.world.addBody(player.body);
    return player;
  }

  createAmmoPoint(x: number, z: number): void {
    const geo = new BufferGeometry();

    const positions: number[] = []
    const vel: Vector3[] = []

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const x = .75 * Math.sqrt(Math.random()) * Math.sin(Math.random() * 2 * Math.PI);
        const y = 0;
        const z = .75 * Math.sqrt(Math.random()) * Math.cos(Math.random() * 2 * Math.PI);
        const velocity = new Vector3(
          0,
          Math.random() * .1,
          0
        );
        // geo.vertices.push(pos);
        positions.push(x, y, z);
        vel.push(velocity);
      }
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const mat = new PointsMaterial({
      size: .1,
      map: TextureManager.getTexture('flare'),
      transparent: true,
      depthTest: false,
      alphaTest: .1
    });

    const points = new Points(geo, mat);
    points.position.set(x, -.45, z);
    this.particles.push({
      geo,
      pos: positions,
      vel
    });

    const ammoPoint = new Mesh();
    ammoPoint.geometry = new CircleBufferGeometry(1, 32);
    ammoPoint.material = new MeshBasicMaterial({ map: TextureManager.getTexture('circle') });
    ammoPoint.rotation.x = -Math.PI / 2;
    ammoPoint.position.set(x, -.46, z);

    const audio = new PositionalAudio(this.audioListener);
    audio.name = "music";
    audio.setBuffer(AudioManager.getAudioBuffer('music'));
    audio.setRefDistance(.3);
    audio.setLoop(true);

    ammoPoint.add(audio);

    // this.scene.add(points);
    // this.scene.add(ammoPoint);
    this.ammoPoints.push(ammoPoint);
  }

  update(): void {
    // console.log('render');
    // this.renderer.render(this.loadingScene, this.camera);
    // this.renderer.render(this.scene, this.camera);
    // this.world.step(1 / 60);

    // this.player.update();
    // this.players.forEach(player => player.update());
    // this.controller.update(1 / 60);
    // this.player.rotation.y = this.controller.getObject().rotation.y;

    // Bullet.update(this.clock.getDelta());
    // this.boxes.forEach(box => box.update());


    // if (this.player.isReloading && this.player.zoom) {
    //   this.player.zoomOut();
    //   this.player.zoom = false;
    //   this.camera.zoom = 1;
    //   this.camera.updateProjectionMatrix();
    //   this.controller.lockY = false;
    // }

    // this.player.setGround(this.controller.ground);

  }

  public static async main() {

    const loading = new LoadingScreen();
    AssetManager.manager.onProgress = (url, loaded: number, total: number) => {
      loading.progress = Math.ceil(loaded / total * 100);
      loading.update();
    }
    AssetManager.manager.onLoad = () => {
      loading.destroy();
      this.getInstance();
    }

    await AssetManager.loadAllAsset();
  }
}

export { Main };