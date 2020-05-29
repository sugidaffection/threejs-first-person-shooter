import { Body, Box, NaiveBroadphase, Vec3, World } from 'cannon-es';
import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { Bullet } from './bullet';
import { Controller } from './controller';
import { Player } from './player';

class Main {
  private readonly world: World = new World({
    broadphase: new NaiveBroadphase(),
    gravity: new Vec3(0, -9.8, 0)
  })
  private readonly scene: Scene = new Scene();
  private readonly renderer: WebGLRenderer = new WebGLRenderer({antialias: false});
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  private readonly canvas: HTMLElement = this.renderer.domElement;
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private readonly textures: Texture[] = [];
  private player!: Player;
  private controller!: Controller;

  constructor() {
    addEventListener('resize', () => this.resizeHandler());
    addEventListener('click', async () => {
      // await this.canvas.requestFullscreen();
      this.canvas.requestPointerLock();
      if(document.pointerLockElement == this.canvas){
        this.controller.enabled = true;
      }
    });
    this.setup();
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  setup(): void {
    this.camera.position.set(0, 2, 5);
    this.camera.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 6);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);

    this.loadAllTextures();
    this.createLight();
    this.createSkyBox();
    this.createFloor();

    this.player = new Player();
    this.scene.add(this.player);
    this.world.addBody(this.player.body);

    this.controller = new Controller(this.camera, this.player);

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
    
    const shape = new Box(new Vec3(25, 25, .1));
    const body = new Body({shape, mass: 0});
    body.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
    mesh.position.fromArray(body.position.toArray());
    this.world.addBody(body);
    this.scene.add(mesh);
  }

  resizeHandler(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(): void{
    this.renderer.render(this.scene, this.camera);
    this.world.step(1/60);
    this.player.update();
    this.controller.update();
    Bullet.update();
  }

  public static main() {
    new Main();
  }
}

window.onload = () => Main.main()