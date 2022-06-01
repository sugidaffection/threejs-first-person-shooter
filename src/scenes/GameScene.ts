import { Ground } from "../objects/Ground";
import { SkyBox } from "../objects/SkyBox";
import { AudioListener, DirectionalLight, HemisphereLight, PerspectiveCamera, Quaternion, Scene, Vector3 } from "three";
import { Bullet } from "../objects/bullet";
import { Player } from "../objects/player";
import { FirstPersonController } from "../controllers/FirstPersonController";
import { FirstPersonCamera } from "../cameras/FirstPersonCamera";

export class GameScene extends Scene {

    private player?: Player;
    private controller?: FirstPersonController;

    private camera?: FirstPersonCamera;
    private audioListener: AudioListener;
    constructor(audioListener: AudioListener) {
        super();
        this.audioListener = audioListener;
    }

    init() {
        const hemisphereLight = new HemisphereLight();
        hemisphereLight.position.set(0, 50, 0);
        hemisphereLight.intensity = .2;
        this.add(hemisphereLight);

        const directionalLight = new DirectionalLight();
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.add(directionalLight);

        let sky = new SkyBox();
        sky.name = 'sky';
        let ground = new Ground(100, 100, new Vector3(0, -1, 0));
        ground.name = 'floor';

        this.add(sky);
        this.add(ground);

        this.camera = new FirstPersonCamera();
        this.camera.position.y = .1;
        this.camera.name = 'camera';
        this.player = new Player(this.audioListener);
        this.controller = new FirstPersonController(this.player, this.camera);

        this.add(this.player, this.camera);

        Bullet.scene = this;
    }

    update(dt) {
        this.camera?.update(dt);
        this.player?.update(dt);
        this.controller?.update(dt);
        Bullet.update(dt);
    }
}