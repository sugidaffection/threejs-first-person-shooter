import { Ground } from "../objects/Ground";
import { SkyBox } from "../objects/SkyBox";
import {
  AudioListener,
  BoxBufferGeometry,
  CameraHelper,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  Vector3,
} from "three";
import { Bullet } from "../objects/bullet";
import { Player } from "../objects/player";
import { FirstPersonController } from "../controllers/FirstPersonController";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";

export class GameScene extends Scene {
  private player?: Player;
  private controller?: FirstPersonController;

  private camera?: FirstPersonCamera;
  private audioListener: AudioListener;

  private raycaster?: Raycaster;
  private world: Group;
  cameraHelper?: CameraHelper;
  constructor(audioListener: AudioListener) {
    super();
    this.audioListener = audioListener;
    this.world = new Group();
  }

  init() {
    const hemisphereLight = new HemisphereLight();
    hemisphereLight.position.set(0, 50, 0);
    hemisphereLight.intensity = 0.2;
    this.add(hemisphereLight);

    const directionalLight = new DirectionalLight();
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.add(directionalLight);

    let sky = new SkyBox();
    sky.name = "sky";
    let ground = new Ground(100, 100, new Vector3(0, -1, 0));
    ground.name = "floor";

    this.add(sky);
    this.add(ground);

    this.camera = new FirstPersonCamera();
    this.camera.name = "camera";
    this.camera.position.y = 0.2;
    this.cameraHelper = new CameraHelper(this.camera);
    this.cameraHelper.position.copy(this.camera.position);
    // this.add(this.cameraHelper, this.camera);

    this.player = new Player(this.audioListener);
    this.player.name = "player";
    this.controller = new FirstPersonController(this.player, this.camera);

    var boxGeometry = new BoxBufferGeometry(1, 1, 1);
    boxGeometry.translate(0, 0, 0);

    for (var i = 0; i < 10; i++) {
      var boxMaterial = new MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        flatShading: false,
        vertexColors: false,
      });

      var mesh = new Mesh(boxGeometry, boxMaterial);
      mesh.position.x = Math.random() * 100 - 80;
      mesh.position.y = 0;
      mesh.position.z = Math.random() * 100 - 80;
      mesh.scale.x = 2;
      mesh.scale.y = Math.random() * 5 + 2;
      mesh.scale.z = 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      this.world.add(mesh);
    }

    this.add(this.player, this.camera, this.world);

    Bullet.scene = this;
  }

  update(dt) {
    this.camera?.update(dt);
    this.player?.update(dt);
    this.controller?.update(dt);
    this.cameraHelper?.update();
    Bullet.update(dt);
  }
}
