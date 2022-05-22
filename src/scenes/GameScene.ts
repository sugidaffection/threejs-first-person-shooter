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

    private camera: PerspectiveCamera;
    private audioListener: AudioListener;
    constructor(camera: PerspectiveCamera, audioListener: AudioListener) {
        super();
        this.camera = camera;
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

        const player = new Player(this.audioListener);
        const fpsCam = new FirstPersonCamera();
        player.setCamera(fpsCam);
        this.player = player;
        this.controller = new FirstPersonController(player, fpsCam);

        this.add(player);

        Bullet.scene = this;
    }

    update(dt) {
        this.controller?.update(dt);
        this.player?.update(dt);

        const camera = this.player?.getCamera()
        if (camera) {
            this.camera.position.copy(camera.getWorldPosition(new Vector3()));
            this.camera.quaternion.copy(camera.getWorldQuaternion(new Quaternion()));
        }
        Bullet.update(dt);
    }
}