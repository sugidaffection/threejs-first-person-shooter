import { Body, Box, ContactMaterial, GSSolver, Material, NaiveBroadphase, Vec3, World } from 'cannon-es';
import io from 'socket.io-client';
import { AudioListener, AudioLoader, BoxGeometry, CircleBufferGeometry, Clock, DirectionalLight, DoubleSide, Geometry, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, NearestFilter, Object3D, PCFSoftShadowMap, PerspectiveCamera, Points, PointsMaterial, PositionalAudio, RepeatWrapping, Scene, Texture, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Box as CustomBox } from './box';
import { Bullet } from './bullet';
import { PointerLockControls } from './lib/PointerLockControls';
import { Player, PlayerJSON } from './player';

enum Keyboard {
  left = 'KeyA',
  right = 'KeyD',
  forward = 'KeyW',
  backward = 'KeyS',
  jump = 'Space',
  reload = 'KeyR'
}

class Main {

  private readonly world: World = new World()
  private readonly scene: Scene = new Scene();
  private readonly renderer: WebGLRenderer = new WebGLRenderer({antialias: false});
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  private readonly canvas: HTMLElement = this.renderer.domElement;
  private readonly clock: Clock = new Clock();
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private readonly textures: Texture[] = [];
  private readonly weapons: Object3D[] = [];

  private readonly audioListener: AudioListener = new AudioListener();

  private ammoPanel: HTMLElement = document.createElement('div');
  private connectionPanel: HTMLElement = document.createElement('div');
  private statusPanel: HTMLElement = document.createElement('ul');

  private footstepBuffer = null;
  private shootBuffer = null;
  private reloadBuffer = null;
  private musicBuffer = null;

  private ammoPoints: Mesh[] = [];
  private particles: {geo: Geometry, pos: Vector3[], vel: Vector3[]}[] = [];

  private player!: Player;
  private controller: any;
  
  private boxes: CustomBox[] = [];
  
  private players: Player[] = [];

  private socket: SocketIOClient.Socket = io('http://localhost:3000');

  constructor() {
    addEventListener('resize', this.resizeHandler.bind(this));
    addEventListener('click', async () => this.canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => this.controller.enabled = document.pointerLockElement == this.canvas);
    addEventListener('mousedown', this.mouseEvent.bind(this));
    addEventListener('keydown', this.keyEvent.bind(this));
    addEventListener('keyup', this.keyEvent.bind(this));
    
    const setup = this.setup();

    this.socket.on('connect', async () => {

      await setup;
      console.log('connected');

      this.player.name = this.socket.id;
      this.socket.emit('join', this.player);
      
      this.socket.on('message::disconnect', (message) => {
        console.log('message');
        const li = document.createElement('li');
        li.innerText = message;
        li.className = 'warning'
        this.statusPanel.append(li);
        li.scrollIntoView();
      });

      this.socket.on('message::connect', (message) => {
        console.log('message');
        const li = document.createElement('li');
        li.innerText = message;
        li.className = 'info'
        this.statusPanel.append(li);
        li.scrollIntoView();
      });

      this.socket.on('player::all', (result: PlayerJSON[]) => {
        result.forEach(data => {
          let player = this.players.find(p => p.name == data.id);
          if(!player){
            player = this.createPlayer(data.id);
            player.updateFromJSON(data);
            this.players.push(player);
          }
        })
      });
      
      this.socket.on('player::joined', (data: PlayerJSON) => {
        let player = this.players.find(p => p.name == data.id);
        if(!player){
          player = this.createPlayer(data.id);
          player.updateFromJSON(data);
          this.players.push(player);
        }
      });

      this.socket.on('player::update', (data: PlayerJSON) => {
        let player = this.players.find(p => p.name == data.id);
        if(player && player.name != this.player.name){
          player.updateFromJSON(data);
        }
      });

      this.socket.on('player::count', (count) => {
        this.connectionPanel.innerText = `online : ${count}`;
      });

      this.socket.on('player::leave', (data: { id: string }) => {
        let player = this.players.find(p => p.name == data.id);
        if(player){
          this.world.removeBody(player.body);
          this.scene.remove(player);
          
          const idx = this.players.indexOf(player);
          this.players.splice(idx, 1);
        }
      })

      this.socket.on('player::shoot', (data: PlayerJSON) => {
        let player = this.players.find(p => p.name == data.id);
        if(player && player.name != this.player.name){
          player.fire();
        }
      })

      this.socket.on('player::reload', (data: PlayerJSON) => {
        let player = this.players.find(p => p.name == data.id);
        if(player && player.name != this.player.name){
          player.reload();
        }
      })
    })

    this.socket.on('disconnect', () => {
      const li = document.createElement('li');
      li.innerText = 'disconnected from the game.';
      li.className = 'warning'
      this.statusPanel.append(li);
      li.scrollIntoView();
    })
  }

  private keyEvent(event: KeyboardEvent): void {
    if(this.controller.enabled && event.code == Keyboard.reload) {
      this.player.reload();
      this.socket.emit('reload', this.player);
    }
  }

  private mouseEvent(event: MouseEvent): void {
    if (event.button == 0 && this.controller.enabled) {
      this.player.fire();
      this.socket.emit('fire', this.player);
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
  }

  private resizeHandler(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  async setup(): Promise<void> {

    // load assets
    await this.loadAudio();
    await this.loadAllWeapons();
    await this.loadAllTextures();

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
    for(let i = -10; i < 10; i+=5) {
      for(let j = -10; j < 10; j+=5) {
        if( i != 0 && j != 0){
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);
  }

  setupUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
    this.ammoPanel.className = 'panel ammoPanel';

    this.connectionPanel.innerText = 'online : 1';
    this.connectionPanel.className = 'panel connectionPanel';

    this.statusPanel.className = 'panel statusPanel';

    const panel = document.getElementById('panelUI');
    if(panel) {
      panel.append(this.ammoPanel);
      panel.append(this.connectionPanel);
      panel.append(this.statusPanel);
    }
  }

  async loadAudio(): Promise<void> {
    const audioLoader = new AudioLoader();
    
    // music
    this.musicBuffer = await audioLoader.loadAsync('/assets/sound/music.mp3');

    // Load fire audio
    this.shootBuffer = await audioLoader.loadAsync('/assets/sound/fire.wav');

    // Load footstep audio
    this.footstepBuffer = await audioLoader.loadAsync('/assets/sound/footstep.wav');

    // Load reload audio
    this.reloadBuffer = await audioLoader.loadAsync('/assets/sound/reload.mp3');
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

  async loadAllTextures(): Promise<void>{
    this.textures.push(await this.textureLoader.loadAsync('assets/sky.jpg'));
    this.textures.push(await this.textureLoader.loadAsync('assets/floor.jpg'));
    this.textures.push(await this.textureLoader.loadAsync('assets/metal.jpg'));
    this.textures.push(await this.textureLoader.loadAsync('assets/flare.png'));
    this.textures.push(await this.textureLoader.loadAsync('assets/circle.jpg'));
  }

  createPlayer(name?: string, body?: boolean): Player {
    const player = new Player(this.audioListener, name, '#fff', body);
    player.setWeapon(this.weapons[0].clone());
    if(this.shootBuffer && this.footstepBuffer && this.reloadBuffer) {
      player.setFireAudio(this.shootBuffer!);
      player.setFootstepAudio(this.footstepBuffer!);
      player.setReloadAudio(this.reloadBuffer!);
    }
    this.scene.add(player);
    if(body !== false)
      this.world.addBody(player.body);
    return player;
  }

  createAmmoPoint(x: number, z: number): void {
    const geo = new Geometry();

    const positions: Vector3[] = []
    const vel: Vector3[] = []

    for(let i = 0; i < 10; i++) {
      for(let j = 0; j < 10; j++) {
        const pos = new Vector3(
          .75 * Math.sqrt(Math.random()) * Math.sin(Math.random() * 2 * Math.PI), 
          0,
          .75 * Math.sqrt(Math.random()) * Math.cos(Math.random() * 2 * Math.PI)
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

    const audio = new PositionalAudio(this.audioListener);
    audio.name = "music";
    audio.setBuffer(this.musicBuffer!);
    audio.setRefDistance(.3);
    audio.setLoop(true);
    
    ammoPoint.add(audio);

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

  createFloor(width: number, height: number, position: Vec3, depth: number = 1): void {

    const material = new MeshPhongMaterial({shadowSide: DoubleSide});
    material.map = this.textures[1].clone();
    material.map.wrapS = material.map.wrapT = RepeatWrapping;
    material.map.repeat.set(width, height);
    material.map.magFilter = NearestFilter;
    material.map.needsUpdate = true;

    const mesh = new Mesh(
      new BoxGeometry(width, height, depth),
      material
    );
    mesh.setRotationFromAxisAngle(new Vector3(1,0,0), -Math.PI / 2);
    mesh.receiveShadow = true;
    
    const shape = new Box(new Vec3(width / 2, height / 2, depth / 2));
    const body = new Body({shape, mass: 0});
    body.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
    body.position.copy(position)
    
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

  updateUI(): void {
    this.ammoPanel.innerText = `Ammo : ${this.player.getAmmo()} / ${this.player.getMagazine()}`;
  }
  
  update(): void {
    this.renderer.render(this.scene, this.camera);
    this.world.step(1/60);

    this.particles.forEach(particle => {
      particle.pos.forEach((pos, i) => {
        pos.add(particle.vel[i]);
        if(pos.y > 3) {
          pos.copy(new Vector3(
            .75 * Math.sqrt(Math.random()) * Math.sin(Math.random() * 2 * Math.PI), 
            0,
            .75 * Math.sqrt(Math.random()) * Math.cos(Math.random() * 2 * Math.PI)
            ));
        }
      })
      particle.geo.verticesNeedUpdate = true;
    });
    this.ammoPoints.forEach(p => {
      if(this.player.position.distanceTo(p.position) < 1) {
        this.player.fillMagazine();
      }
      const audio: any = p.getObjectByName('music');

      if(audio && !audio.isPlaying){
        audio.play();
      }
    })

    this.player.update();
    this.players.forEach(player => player.update());
    this.controller.update(1/60);
    this.player.rotation.y = this.controller.getObject().rotation.y;

    Bullet.update(this.clock.getDelta());
    this.boxes.forEach(box => box.update());

    this.updateUI();

    if(this.player.isReloading && this.player.zoom){
      this.player.zoomOut();
      this.player.zoom = false;
      this.camera.zoom = 1;
      this.camera.updateProjectionMatrix();
      this.controller.lockY = false;
    }

    this.player.setGround(this.controller.ground);
    
    this.socket.emit('update', this.player);
  }

  public static main() {
    new Main();
  }
}

window.onload = () => Main.main()