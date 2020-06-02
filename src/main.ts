import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { AudioLoader, BoxGeometry, Clock, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Bullet } from './bullet';
import { PointerLockControls } from './lib/PointerLockControls';
import { Player } from './player';


enum Keyboard {
  left = 'KeyA',
  right = 'KeyD',
  forward = 'KeyW',
  backward = 'KeyS',
  jump = 'Space',
  reload = 'KeyR'
}

class Main {
  private readonly world: World = new World({
    broadphase: new NaiveBroadphase(),
    gravity: new Vec3(0, -20, 0)
  })
  private readonly scene: Scene = new Scene();
  private readonly renderer: WebGLRenderer = new WebGLRenderer({antialias: false});
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  private readonly camera2: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  private readonly canvas: HTMLElement = this.renderer.domElement;
  private readonly clock: Clock = new Clock();
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private readonly textures: Texture[] = [];
  private readonly weapons: Object3D[] = [];
  private footstepBuffer = null;
  private shootBuffer = null;
  private reloadBuffer = null;

  private player!: Player;
  private controller: any;
  
  constructor() {
    addEventListener('resize', this.resizeHandler.bind(this));
    addEventListener('click', async () => {
      // await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.controller.enabled = document.pointerLockElement == this.canvas;
    });
    addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button == 0 && this.controller.enabled) {
        this.player.fire();
      }
      
      if(event.button == 2 && this.controller.enabled) {
        this.player.zoom = !this.player.zoom;
        if(this.player.zoom) {
          this.player.zoomIn();
          this.camera.zoom = 5;
          this.camera.updateProjectionMatrix();
        }
        else {
          this.player.zoomOut();
          this.camera.zoom = 1;
          this.camera.updateProjectionMatrix();
        }
      }
    });
    addEventListener('keydown', this.keyEvent.bind(this));
    addEventListener('keyup', this.keyEvent.bind(this));
    this.setup();

  }

  async setup(): Promise<void> {

    // setup renderer
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);

    this.camera2.position.setZ(2);
    this.camera2.position.setY(3);
    this.camera2.setRotationFromAxisAngle(new Vector3(1,0,0), -Math.PI / 6);

    // setup world
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

    // setup audio
    await this.loadAudio();

    // setup scene
    this.loadAllTextures();
    this.createLight();
    this.createSkyBox();
    this.createFloor();

    // load weapons
    await this.loadAllWeapons();

    // setup player;
    this.player = new Player();
    this.player.setWeapon(this.weapons[0]);
    if(this.shootBuffer && this.footstepBuffer && this.reloadBuffer) {
      this.player.setFireAudio(this.shootBuffer!);
      this.player.setFootstepAudio(this.footstepBuffer!);
      this.player.setReloadAudio(this.reloadBuffer!);
    }

    this.scene.add(this.player);
    this.world.addBody(this.player.body);

    // setup controller
    this.controller = new PointerLockControls(this.camera, this.player.body);
    this.scene.add(this.controller.getObject());

    Bullet.world = this.world;
    Bullet.scene = this.scene;

    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  async loadAudio(): Promise<void> {
    const audioLoader = new AudioLoader();
    // Load fire audio
    this.shootBuffer = await audioLoader.loadAsync('/assets/sound/fire.wav');

    // Load footstep audio
    this.footstepBuffer = await audioLoader.loadAsync('/assets/sound/footstep.wav');

    // Load reload audio
    this.reloadBuffer = await audioLoader.loadAsync('/assets/sound/reload.mp3');
  }

  keyEvent(event: KeyboardEvent) {
    if(this.controller.enabled && event.code == Keyboard.reload) {
      this.player.reload();
    }
  }

  loadAllTextures(){
    this.textures.push(this.textureLoader.load('assets/sky.jpg'));
    
    const floor = this.textureLoader.load('assets/floor.jpg');
    floor.wrapS = floor.wrapT = RepeatWrapping;
    floor.repeat.set(50, 50);
    floor.magFilter = NearestFilter;
    this.textures.push(floor);
  }

  async loadAllWeapons(): Promise<void>{
    // Load ump47
    const materials = await new MTLLoader().loadAsync('/assets/ump47.mtl');
    materials.preload();

    const object = await new OBJLoader().loadAsync('/assets/ump47.obj');
    const obj: Object3D = new Object3D();
    obj.add(object);

    this.weapons.push(obj);
  }

  createLight(){
    const light = new PointLight();
    light.castShadow = true;
    light.position.set(0, 100, 0);
    light.intensity = 1
    this.scene.add(light);
  }

  createSkyBox(){
    const mesh = new Mesh(
      new BoxGeometry(1000, 1000, 1000),
      new MeshBasicMaterial({map: this.textures[0], side: DoubleSide})
    );
    this.scene.add(mesh);
  }

  createFloor(): void {
    const mesh = new Mesh(
      new PlaneGeometry(50, 50),
      new MeshPhongMaterial({map: this.textures[1], shadowSide: DoubleSide})
    );
    mesh.setRotationFromAxisAngle(new Vector3(1,0,0), -Math.PI / 2);
    mesh.receiveShadow = true;
    mesh.position.y = -1;
    
    const shape = new Box(new Vec3(25, 25, .1));
    const body = new Body({shape, mass: 0});
    body.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
    body.position.y = -1;
    this.world.addBody(body);
    this.scene.add(mesh);
  }

  resizeHandler(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(): void {
    // this.camera2.lookAt(this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.world.step(1/60);
    this.player.update();
    this.controller.update(1/60);
    this.player.rotation.y = this.controller.getObject().rotation.y;

    Bullet.update(this.clock.getDelta());
    
  }

  public static main() {
    new Main();
  }
}

window.onload = () => Main.main()