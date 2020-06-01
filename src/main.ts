import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { BoxGeometry, Clock, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { Bullet } from './bullet';
import { PointerLockControls } from './lib/PointerLockControls';
import { Player } from './player';

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
    addEventListener('mousedown', this.shoot.bind(this));
    this.setup();
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  setup(): void {

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

    // setup renderer
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);

    // setup scene
    this.loadAllTextures();
    this.createLight();
    this.createSkyBox();
    this.createFloor();

    this.player = new Player();
    this.scene.add(this.player);
    this.world.addBody(this.player.body);

    // setup controller
    this.controller = new PointerLockControls(this.camera, this.player.body);
    this.scene.add(this.controller.getObject());

    Bullet.world = this.world;
    Bullet.scene = this.scene;

  }

  loadAllTextures(){
    this.textures.push(this.textureLoader.load('assets/sky.jpg'));
    
    const floor = this.textureLoader.load('assets/floor.jpg');
    floor.wrapS = floor.wrapT = RepeatWrapping;
    floor.repeat.set(50, 50);
    floor.magFilter = NearestFilter;
    this.textures.push(floor);
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

  shoot(): void {
    if (this.controller.enabled) {
      const rotation = this.controller.getObject().rotation;
      Bullet.create(
        this.player.uuid.toString(), 
        new Vec3(
          -1 * Math.sin(rotation.y) + this.player.position.x,
          this.player.position.y,
          -1 * Math.cos(rotation.y) + this.player.position.z
        ),
        new Vec3(
          -50 * Math.sin(rotation.y) + this.player.position.x,
          0,
          -50 * Math.cos(rotation.y) + this.player.position.z
        )
      );
    }
  }

  update(): void {
    this.camera2.lookAt(this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.world.step(1/60);
    this.player.update();
    this.controller.update(this.clock.getDelta());
    this.player.rotation.y = this.controller.getObject().rotation.y;

    Bullet.update();
  }

  public static main() {
    new Main();
  }
}

window.onload = () => Main.main()