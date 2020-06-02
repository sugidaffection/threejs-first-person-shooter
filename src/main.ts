import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { AudioLoader, BoxGeometry, CircleBufferGeometry, Clock, DirectionalLight, DoubleSide, Geometry, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, Object3D, PCFSoftShadowMap, PerspectiveCamera, Points, PointsMaterial, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Box as CustomBox } from './box';
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

  private ammoPoints: Mesh[] = [];
  private particles: {geo: Geometry, pos: Vector3[], vel: Vector3[]}[] = [];

  private player!: Player;
  private controller: any;
  
  private boxes: CustomBox[] = [];
  
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
      
      if(event.button == 2 && this.controller.enabled && !this.player.isReloading) {
        this.player.zoom = !this.player.zoom;
        if(this.player.zoom) {
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
    this.createAmmoPoint(20, 0);
    
    // create box
    for(let i = -10; i < 10; i+=5) {
      for(let j = -10; j < 10; j+=5) {
        if( i != 0 && j != 0){
          this.createBox(i, 10, j);
        }
      }
    }

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
    this.setupUI();

  }

  private ammoPanel: HTMLElement = document.createElement('div');

  setupUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
    this.ammoPanel.classList.add('ammoPanel');
    document.body.append(this.ammoPanel);
  }

  updateUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
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

  loadAllTextures(): void{
    this.textures.push(this.textureLoader.load('assets/sky.jpg'));
    
    const floor = this.textureLoader.load('assets/floor.jpg');
    floor.wrapS = floor.wrapT = RepeatWrapping;
    floor.repeat.set(50, 50);
    floor.magFilter = NearestFilter;
    this.textures.push(floor);

    this.textures.push(this.textureLoader.load('assets/metal.jpg'));
    this.textures.push(this.textureLoader.load('assets/flare.png'));
    this.textures.push(this.textureLoader.load('assets/circle.jpg'));
  }

  async loadAllWeapons(): Promise<void>{
    // Load ump47
    const materials = await new MTLLoader().loadAsync('/assets/ump47.mtl');
    materials.preload();

    const ump47 = await new OBJLoader().loadAsync('/assets/ump47.obj');
    const obj: Object3D = new Object3D();
    obj.add(ump47);

    this.weapons.push(obj);
  }

  createAmmoPoint(x: number, z: number): void {
    const geo = new Geometry();

    const positions: Vector3[] = []
    const vel: Vector3[] = []

    for(let i = 0; i < 10; i++) {
      for(let j = 0; j < 10; j++) {
        const pos = new Vector3(
          1 * Math.sqrt(Math.random()) * Math.sin(Math.random() * 2 * Math.PI), 
          0,
          1 * Math.sqrt(Math.random()) * Math.cos(Math.random() * 2 * Math.PI)
          );
        const velocity = new Vector3(
          0, 
          Math.random() * .1,
          0
        );
        geo.vertices.push(pos);
        positions.push(pos);
        vel.push(velocity);
      }
    }

    const mat = new PointsMaterial({
      size: .1, 
      map: this.textures[3], 
      transparent: true,
      depthTest: false,
      alphaTest: .1
    });
    
    const points = new Points(geo, mat);
    points.position.set(x,-.45,z);
    this.particles.push({
      geo,
      pos: positions,
      vel
    });

    
    const ammoPoint = new Mesh();
    ammoPoint.geometry = new CircleBufferGeometry(1, 32);
    ammoPoint.material = new MeshBasicMaterial({map: this.textures[4]});
    ammoPoint.rotation.x = -Math.PI / 2;
    ammoPoint.position.set(x, -.46, z);

    this.scene.add(points);
    this.scene.add(ammoPoint);
    this.ammoPoints.push(ammoPoint);
  }

  createLight(): void{

    const hemisphereLight = new HemisphereLight();
    hemisphereLight.position.set(0, 50, 0);
    hemisphereLight.intensity = .2;
    this.scene.add(hemisphereLight);

    const directionalLight = new DirectionalLight();
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  createSkyBox(): void{
    const mesh = new Mesh(
      new BoxGeometry(1000, 1000, 1000),
      new MeshBasicMaterial({map: this.textures[0], side: DoubleSide})
    );
    this.scene.add(mesh);
  }

  createFloor(): void {
    const mesh = new Mesh(
      new BoxGeometry(50, 50, 1),
      new MeshPhongMaterial({map: this.textures[1], shadowSide: DoubleSide})
    );
    mesh.setRotationFromAxisAngle(new Vector3(1,0,0), -Math.PI / 2);
    mesh.receiveShadow = true;
    
    const shape = new Box(new Vec3(25, 25, .5));
    const body = new Body({shape, mass: 0});
    body.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
    body.position.y = -1;
    
    mesh.position.fromArray(body.position.toArray());

    this.world.addBody(body);
    this.scene.add(mesh);
  }

  createBox(x: number, y: number, z: number): CustomBox {
    const box = new CustomBox(new Vec3(x, y, z), this.textures[2]);
    this.boxes.push(box);
    this.world.addBody(box.body);
    this.scene.add(box);

    return box;
  }

  keyEvent(event: KeyboardEvent) {
    if(this.controller.enabled && event.code == Keyboard.reload) {
      this.player.reload();
    }
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

    this.particles.forEach(particle => {
      particle.pos.forEach((pos, i) => {
        pos.add(particle.vel[i]);
        if(pos.y > 3) pos.y = 0;
      })
      particle.geo.verticesNeedUpdate = true;
    });
    this.ammoPoints.forEach(p => {
      if(this.player.position.distanceTo(p.position) < 1) {
        this.player.fillMagazine();
      }
    })

    this.player.update();
    this.controller.update(1/60);
    this.player.rotation.y = this.controller.getObject().rotation.y;

    Bullet.update(this.clock.getDelta());
    this.boxes.forEach(box => box.update());

    // this.debugger.update();
    
    this.updateUI();

    if(this.player.isReloading && this.player.zoom){
      this.player.zoomOut();
      this.player.zoom = false;
      this.camera.zoom = 1;
      this.camera.updateProjectionMatrix();
      this.controller.lockY = false;
    }
    
  }

  public static main() {
    new Main();
  }
}

window.onload = () => Main.main()