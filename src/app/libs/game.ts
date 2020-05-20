import { Body, Box, CannonDebugRenderer, Material, NaiveBroadphase, Sphere, Vec3, World } from 'cannon-es';
import {
  BoxGeometry,
  Clock,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion, Scene, SphereGeometry, TextureLoader, Vector3, WebGLRenderer
} from 'three';
import { Player } from './player';

export class Game {

  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private clock: Clock;

  private world: World;

  private player: Player;
  private plane;
  private skybox;
  private input = {};

  private cameraReady: boolean;
  private isReady: boolean;

  private bullets: {}[] = [];
  private box: {}[] = [];

  private debug: CannonDebugRenderer;

  constructor(width: number, height: number){
   this.scene = new Scene();
   this.renderer = new WebGLRenderer({
     antialias: true
   });
   this.camera = new PerspectiveCamera(75, width / height, .1, 1000);
   this.renderer.setSize(width, height);
  //  this.renderer.setPixelRatio(.5);

   this.camera.position.setZ(20);
   this.camera.position.setY(20);
   this.camera.rotateX(-35 * Math.PI / 180);

   this.clock = new Clock();

   this.setupKeyboard();
   this.setupPhysisc();
   this.setup();


   this.player.controls.addEventListener('lock', () => {
    this.resize(window.innerWidth, window.innerHeight);
    this.domElement.style.position = 'fixed';
    this.domElement.style.top = '0';
   });

   this.player.controls.addEventListener('unlock', () => {
    this.resize(width, height);
    this.domElement.style.position = 'relative';
   });

   this.update(() => {

    const dt = this.clock.getDelta();

    this.player.update(dt);
    this.player.event(this.input, dt);
    this.updateCamera(dt);

    for (const bullet of this.bullets){
      bullet.mesh.position.copy(new Vector3(
        bullet.body.position.x,
        bullet.body.position.y,
        bullet.body.position.z
      ));

    }

    for (const box of this.box){
      box.mesh.position.copy(new Vector3(
        box.body.position.x,
        box.body.position.y,
        box.body.position.z
      ));

      box.mesh.quaternion.set(
        box.body.quaternion.x,
        box.body.quaternion.y,
        box.body.quaternion.z,
        box.body.quaternion.w
      )
    }
   });

   this.domElement.onclick = () => {
    this.start();

    if (this.bullets.length > 10) {
      const bullet = this.bullets.shift();
      this.scene.remove(bullet.mesh);
      this.world.removeBody(bullet.body);
    }

    if (this.cameraReady) {

      const bullet = new Mesh(
        new SphereGeometry(.1, 32, 32),
        new MeshBasicMaterial({color: 0x000000})
      );

      const rotation = this.player.getCamera().rotation;
      bullet.position.x = Math.sin(rotation.y) + this.player.position.x;
      bullet.position.y = this.player.position.y;
      bullet.position.z = Math.cos(rotation.y) + this.player.position.z;

      this.scene.add(bullet);
      const shape = new Sphere(.05);
      const body = new Body({mass: .2, shape});
      body.position.copy(new Vec3(
        bullet.position.x,
        bullet.position.y,
        bullet.position.z
      ));

      body.velocity.set(
        -Math.sin(rotation.y) * 20,
        0,
        Math.cos(rotation.y) * 20
      );

      this.world.addBody(body);

      this.bullets.push({
        mesh: bullet,
        body
      });
    }
  };

  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateCamera(dt): void {
    const position = this.player.position.clone();
    position.y += .5;

    if (!this.cameraReady) {
      this.camera.position.lerp(position, .05);

      if(this.camera.position.distanceTo(position) < 1) {
        this.camera.quaternion.slerp(this.player.quaternion, .05);
      }

      if (this.camera.position.distanceTo(position) < .5){
        this.cameraReady = true;
      }

    } else {
      this.camera.position.copy(position);
      this.camera.quaternion.copy(this.player.quaternion);
    }

  }

  keyEvent(event: KeyboardEvent): void {
    this.input[event.code] = event.type === 'keydown';
  }

  setupKeyboard(): void {
    document.onkeydown = (e) => this.keyEvent(e);
    document.onkeyup = (e) => this.keyEvent(e);
  }

  setupPhysisc(): void {
    this.world = new World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new NaiveBroadphase();
  }

  setup(): void {

    const loader = new TextureLoader();
    this.skybox = new Mesh(
      new SphereGeometry(1000, 2, 2),
      new MeshBasicMaterial({map: loader.load('assets/sky.jpg'), side: DoubleSide})
    );

    this.scene.add(this.skybox);

    this.player = new Player(this.renderer, this.scene, this.world);
    const planeMesh = new Mesh(
      new PlaneGeometry(20, 20),
      new MeshBasicMaterial({map: loader.load('assets/floor.jpg')})
    );

    const planeMaterial = new Material();
    const planeShape = new Box(new Vec3(10, 10, .1));
    const planeBody = new Body({mass: 0, shape: planeShape, material: planeMaterial});
    planeBody.position.y = -5;
    planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    planeMesh.quaternion.copy(planeBody.quaternion as unknown as Quaternion);
    planeMesh.position.copy(planeBody.position as unknown as Vector3);

    this.plane = {
      body: planeBody,
      mesh: planeMesh
    };

    this.world.addBody(planeBody);
    this.scene.add(planeMesh);


    for (let i = 0; i < 5; i++){
      const mesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({map: loader.load('assets/metal.jpg')})
      );
      mesh.position.set(Math.random() * i, 1, Math.random() * i);

      const body = new Body({
        mass: .2,
        shape: new Box(new Vec3(.5, .5, .5))
      });

      body.position.copy(
        new Vec3(
          mesh.position.x,
          mesh.position.y,
          mesh.position.z
        )
      );


      this.box.push({
        body,
        mesh
      });
      this.scene.add(mesh);
      this.world.addBody(body);
    }
  }

  fixedUpdate(): void{
    this.world.step(1 / 60);
    this.renderer.render(this.scene, this.camera);

  }

  update(callback: () => void): void{

    if(this.isReady){
      this.fixedUpdate();

      callback();
    }
    requestAnimationFrame(() => this.update(callback));
  }

  get domElement(): HTMLCanvasElement{
    return this.renderer.domElement;
  }

  start(){
    this.isReady = true;
    this.player.controls.lock();
  }

}
