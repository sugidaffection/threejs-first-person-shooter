import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { AudioLoader, BoxGeometry, CircleBufferGeometry, BufferGeometry, Clock, DirectionalLight, DoubleSide, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, Object3D, PCFSoftShadowMap, PerspectiveCamera, Points, PointsMaterial, PositionalAudio, RepeatWrapping, Scene, TextureLoader, Vector3, WebGLRenderer, Float32BufferAttribute, LoadingManager, DefaultLoadingManager } from 'three';
import { AudioListener } from 'three/src/audio/AudioListener';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Box as CustomBox } from './box';
import { Bullet } from './bullet';
import { PointerLockControls } from './libs/PointerLockControls';
import { Player } from './player';
import { AudioManager } from './audio';
import { Keyboard } from './controller';
import { TextureManager } from './texture';

const [WIDTH, HEIGHT] = [800, 600];

const getCanvas = document.querySelector('canvas') || (() => {
  const canvas = document.createElement('canvas');
  document.querySelector('main')?.append(canvas);
  return canvas;
})()

class Main {

  static getInstance(): Main {
    if (!this.instance) this.instance = new Main();
    return this.instance;
  }

  static async loadAudio(): Promise<void> {
    await Promise.all(
      [AudioManager.addAudio({ name: 'music', url: '/assets/sound/music.mp3' }),
      AudioManager.addAudio({ name: 'fire', url: '/assets/sound/fire.wav' }),
      AudioManager.addAudio({ name: 'footstep', url: '/assets/sound/footstep.wav' }),
      AudioManager.addAudio({ name: 'reload', url: '/assets/sound/reload.mp3' }),
      ]
    )
  }

  static async loadAllWeapons(): Promise<void> {
    // Load ump47
    const materials = await new MTLLoader(this.loadingManager).loadAsync('/assets/ump47.mtl');
    materials.preload();

    const ump47 = await new OBJLoader(this.loadingManager).loadAsync('/assets/ump47.obj');
    const obj: Object3D = new Object3D();
    obj.add(ump47);

    this.weapons.push(obj);
  }

  static async loadAllTextures(): Promise<void> {
    await Promise.all([
      TextureManager.loadTexture({ name: 'sky', url: 'assets/sky.jpg' }),
      TextureManager.loadTexture({ name: 'floor', url: 'assets/floor.jpg' }),
      TextureManager.loadTexture({ name: 'metal', url: 'assets/metal.jpg' }),
      TextureManager.loadTexture({ name: 'flare', url: 'assets/flare.png' }),
      TextureManager.loadTexture({ name: 'circle', url: 'assets/circle.jpg' }),
    ])
  }

  private static instance: Main;
  private static loadingManager: LoadingManager = new LoadingManager();
  private static readonly weapons: Object3D[] = [];

  private readonly world: World = new World()
  private readonly scene: Scene = new Scene();
  private readonly canvas: HTMLElement = getCanvas;
  private readonly renderer: WebGLRenderer = new WebGLRenderer({ antialias: false, canvas: this.canvas });
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, WIDTH / HEIGHT, .1, 1000);
  private readonly clock: Clock = new Clock();

  private readonly audioListener: AudioListener = new AudioListener();

  private ammoPanel: HTMLElement = document.createElement('div');
  private connectionPanel: HTMLElement = document.createElement('div');
  private statusPanel: HTMLElement = document.createElement('ul');

  private ammoPoints: Mesh[] = [];
  private particles: { geo: BufferGeometry, pos: number[], vel: Vector3[] }[] = [];

  private player!: Player;
  private controller: any;

  private boxes: CustomBox[] = [];

  private players: Player[] = [];


  constructor() {
    addEventListener('resize', this.resizeHandler.bind(this));
    this.canvas.addEventListener('click', async () => {
      await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      if (this.controller && this.player)
        this.controller.enabled = document.pointerLockElement == this.canvas
    });
    addEventListener('mousedown', this.mouseEvent.bind(this));
    addEventListener('keydown', this.keyEvent.bind(this));
    addEventListener('keyup', this.keyEvent.bind(this));

    this.setup();
  }

  private keyEvent(event: KeyboardEvent): void {
    if (this.controller.enabled && event.code == Keyboard.RELOAD) {
      this.player.reload();
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
    this.setupWorld();

    // setup renderer
    this.setupRenderer();

    // setup scene
    this.createLight();
    this.createSkyBox();

    this.createFloor(50, 50, new Vec3(0, -1, 0));
    this.createFloor(1, 1, new Vec3(3, 0, 3), .1);
    this.createFloor(1, 1, new Vec3(5, .5, 3), .1);
    this.createFloor(1, 1, new Vec3(7, 1, 3), .1);
    this.createFloor(1, 1, new Vec3(9, 1.5, 3), .1);
    this.createFloor(1, 4, new Vec3(9, 1.5, 5), .1);
    this.createFloor(2, 2, new Vec3(10, 1.5, 10), 1);

    this.createAmmoPoint(-20, 0);
    this.createAmmoPoint(20, 0);
    this.createAmmoPoint(0, -20);
    this.createAmmoPoint(0, 20);

    // create box
    for (let i = -10; i < 10; i += 5) {
      for (let j = -10; j < 10; j += 5) {
        if (i != 0 && j != 0) {
          this.createBox(i, 2, j);
        }
      }
    }

    // setup player;
    this.player = this.createPlayer();
    this.player.add(this.audioListener);

    // setup controller
    this.controller = new PointerLockControls(this.camera, this.player.body);
    this.scene.add(this.controller.getObject());

    // setup Bullet
    Bullet.world = this.world;
    Bullet.scene = this.scene;

    // render animation
    this.renderer.setAnimationLoop(this.update.bind(this));

    // set ui
    this.setupUI();

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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(WIDTH, HEIGHT);
  }

  setupUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
    this.ammoPanel.className = 'panel ammoPanel';

    this.connectionPanel.innerText = 'online : 1';
    this.connectionPanel.className = 'panel connectionPanel';

    this.statusPanel.className = 'panel statusPanel';

    const panel = document.getElementById('panelUI');
    if (panel) {
      panel.append(this.ammoPanel);
      panel.append(this.connectionPanel);
      panel.append(this.statusPanel);
    }
  }

  createPlayer(name?: string, body?: boolean): Player {
    const player = new Player(this.audioListener, name, '#fff', body);
    player.setWeapon(Main.weapons[0].clone());
    this.scene.add(player);
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

    this.scene.add(points);
    this.scene.add(ammoPoint);
    this.ammoPoints.push(ammoPoint);
  }

  createLight(): void {

    const hemisphereLight = new HemisphereLight();
    hemisphereLight.position.set(0, 50, 0);
    hemisphereLight.intensity = .2;
    this.scene.add(hemisphereLight);

    const directionalLight = new DirectionalLight();
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  createSkyBox(): void {
    const mesh = new Mesh(
      new BoxGeometry(1000, 1000, 1000),
      new MeshBasicMaterial({ map: TextureManager.getTexture('sky'), side: DoubleSide })
    );
    this.scene.add(mesh);
  }

  createFloor(width: number, height: number, position: Vec3, depth: number = 1): void {

    const material = new MeshPhongMaterial({ shadowSide: DoubleSide });
    material.map = TextureManager.getTexture('floor');
    material.map.wrapS = material.map.wrapT = RepeatWrapping;
    material.map.repeat.set(width, height);
    material.map.magFilter = NearestFilter;
    material.map.needsUpdate = true;

    const mesh = new Mesh(
      new BoxGeometry(width, height, depth),
      material
    );
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
    mesh.receiveShadow = true;

    const shape = new Box(new Vec3(width / 2, height / 2, depth / 2));
    const body = new Body({ shape, mass: 0 });
    body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    body.position.copy(position)

    mesh.position.fromArray(body.position.toArray());

    this.world.addBody(body);
    this.scene.add(mesh);
  }

  createBox(x: number, y: number, z: number): CustomBox {
    const box = new CustomBox(new Vec3(x, y, z), TextureManager.getTexture('metal'));
    this.boxes.push(box);
    this.world.addBody(box.body);
    this.scene.add(box);

    return box;
  }

  updateUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
  }

  update(): void {
    this.renderer.render(this.scene, this.camera);
    this.world.step(1 / 60);

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
    this.ammoPoints.forEach(p => {
      if (this.player.position.distanceTo(p.position) < 1) {
        this.player.fillMagazine();
      }
      const audio: any = p.getObjectByName('music');

      if (audio && !audio.isPlaying) {
        audio.play();
      }
    })

    this.player.update();
    this.players.forEach(player => player.update());
    this.controller.update(1 / 60);
    this.player.rotation.y = this.controller.getObject().rotation.y;

    Bullet.update(this.clock.getDelta());
    this.boxes.forEach(box => box.update());

    this.updateUI();

    if (this.player.isReloading && this.player.zoom) {
      this.player.zoomOut();
      this.player.zoom = false;
      this.camera.zoom = 1;
      this.camera.updateProjectionMatrix();
      this.controller.lockY = false;
    }

    this.player.setGround(this.controller.ground);

    // this.socket.emit('update', this.player);
  }

  public static async main() {
    const canvas = document.querySelector('canvas');
    canvas!.style.display = 'none';

    AudioManager.setLoadingManager(this.loadingManager);
    TextureManager.setLoadingManager(this.loadingManager);

    let progress = 0;
    const loading: HTMLElement = document.querySelector('.loading')!;
    const bar: HTMLElement = document.querySelector('.loading-bar')!;

    this.loadingManager.onProgress = (url, loaded: number, total: number) => {
      progress = loaded / total * 100;
      console.log(progress);
      bar?.setAttribute('style', 'width: ' + progress + '%');
      loading?.setAttribute('value', String((progress).toFixed()));
    }

    this.loadingManager.onLoad = () => {
      if (progress >= 100) {
        loading.style.display = 'none';
        canvas?.removeAttribute('style');
        setTimeout(() => {
          this.getInstance();

        }, 1000)
      }

    }
    // load assets
    await Promise.all(
      [
        this.loadAudio(),
        this.loadAllWeapons(),
        this.loadAllTextures(),
      ]
    )

  }
}

export { Main };