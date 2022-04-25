import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { AudioLoader, BoxGeometry, CircleBufferGeometry, BufferGeometry, Clock, DirectionalLight, DoubleSide, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, Object3D, PCFSoftShadowMap, PerspectiveCamera, Points, PointsMaterial, PositionalAudio, RepeatWrapping, Scene, TextureLoader, Vector3, WebGLRenderer, Float32BufferAttribute, LoadingManager, DefaultLoadingManager } from 'three';
import { AudioListener } from 'three/src/audio/AudioListener';
import { Box as CustomBox } from './objects/box';
import { Bullet } from './objects/bullet';
import { PointerLockControls } from './libs/PointerLockControls';
import { Player } from './objects/player';
import { AudioManager } from './manager/AudioManager';
import { TextureManager } from './manager/TextureManager';
import { Controller } from './inputs/Controller';
import { GameEvent } from './events/GameEvent';
import { AssetManager } from './manager/AssetManager';
import { WeaponManager } from './manager/WeaponManager';
import { GameScene } from './scenes/GameScene';
import { LoadingScene } from './scenes/LoadingScene';

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
  private static isLoaded: boolean = false;
  private readonly world: World = new World()
  private readonly canvas: HTMLElement = getCanvas;
  private readonly renderer: WebGLRenderer = new WebGLRenderer({ antialias: false, canvas: this.canvas });
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, WIDTH / HEIGHT, .1, 1000);
  // private readonly gameScene: GameScene = new GameScene();
  private readonly loadingScene: LoadingScene = new LoadingScene();
  private readonly clock: Clock = new Clock();

  private readonly audioListener: AudioListener = new AudioListener();

  private ammoPoints: Mesh[] = [];
  private particles: { geo: BufferGeometry, pos: number[], vel: Vector3[] }[] = [];

  private player!: Player;
  private controller: any;

  private boxes: CustomBox[] = [];

  private players: Player[] = [];


  constructor() {
    super();
    // addEventListener('resize', this.resizeHandler.bind(this));
    // this.canvas.addEventListener('click', async () => {
    //   await this.canvas.requestFullscreen();
    //   this.canvas.requestPointerLock();
    // });
    // document.addEventListener('pointerlockchange', () => {
    //   if (this.controller && this.player)
    //     this.controller.enabled = document.pointerLockElement == this.canvas
    // });
    // addEventListener('mousedown', this.mouseEvent.bind(this));
    // addEventListener('keydown', this.keyEvent.bind(this));
    // addEventListener('keyup', this.keyEvent.bind(this));

    this.setup();

    console.log('setup');

    // console.log(this.renderer.info.render.triangles)
  }

  inputEvent(e: KeyboardEvent | MouseEvent): void {
    super.inputEvent(e);
    if (this.controller.enabled) {
      if (Controller.RELOAD) this.player.reload();
      if (Controller.FIRE) this.player.fire();
    }
  }

  private mouseEvent(event: MouseEvent): void {
    if (event.button == 0 && this.controller.enabled) {
      this.player.fire();
    }

    if (event.button == 2 && this.controller.enabled && !this.player.isReloading) {
      this.player.zoom = !this.player.zoom;
      if (this.player.zoom) {
        this.player.zoomIn();
        this.camera.zoom = 5;
        this.camera.updateProjectionMatrix();
        this.controller.lockY = true;
      }
      else {
        this.player.zoomOut();
        this.camera.zoom = 1;
        this.camera.updateProjectionMatrix();
        this.controller.lockY = false;
      }
    }
  }

  private resizeHandler(): void {
    const [width, height] = [WIDTH, HEIGHT];
    this.renderer.setSize(width, height);
    let aspectRatio = width / height;
    if (height > width) aspectRatio = height / width;
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
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

    // setup Bullet
    // Bullet.world = this.world;
    // Bullet.scene = this.scene;

    // render animation
    this.renderer.render(this.loadingScene, this.camera);
    this.renderer.setAnimationLoop(this.update.bind(this));
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
    this.renderer.setClearColor(0xffffff);
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(WIDTH, HEIGHT);
    this.renderer.setPixelRatio(window.devicePixelRatio * .8);
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
    this.loadingScene.update();
    // console.log('render');
    this.renderer.render(this.loadingScene, this.camera);
    // this.renderer.render(this.scene, this.camera);
    // this.world.step(1 / 60);

    // this.particles.forEach(particle => {
    //   particle.pos.forEach((pos, i) => {
    //     pos.add(particle.vel[i]);
    //     if (pos.y > 3) {
    //       pos.copy(new Vector3(
    //         .75 * Math.sqrt(Math.random()) * Math.sin(Math.random() * 2 * Math.PI),
    //         0,
    //         .75 * Math.sqrt(Math.random()) * Math.cos(Math.random() * 2 * Math.PI)
    //       ));
    //     }
    //   })
    //   // particle.geo.verticesNeedUpdate = true;
    // });
    // this.ammoPoints.forEach(p => {
    //   if (this.player.position.distanceTo(p.position) < 1) {
    //     this.player.fillMagazine();
    //   }
    //   const audio: any = p.getObjectByName('music');

    //   if (audio && !audio.isPlaying) {
    //     audio.play();
    //   }
    // })

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

    // this.socket.emit('update', this.player);
  }

  public static async main() {
    // const canvas = document.querySelector('canvas');
    // canvas!.style.display = 'none';

    // let progress = 0;
    // const loading: HTMLElement = document.querySelector('.loading')!;
    // const bar: HTMLElement = document.querySelector('.loading-bar')!;

    this.getInstance();


    AssetManager.manager.onProgress = (url, loaded: number, total: number) => {
      // progress = loaded / total * 100;
      // bar?.setAttribute('style', 'width: ' + progress + '%');
      // loading?.setAttribute('value', String((progress).toFixed()));
      console.log(loaded)
    }

    // this.loadingManager.onLoad = () => {
    //   if (progress >= 100) {
    //     loading.style.display = 'none';
    //     canvas?.removeAttribute('style');
    //     setTimeout(() => {
    //       this.getInstance();

    //     }, 1000)
    //   }

    // }

    await AssetManager.loadAllAsset();
  }
}

export { Main };