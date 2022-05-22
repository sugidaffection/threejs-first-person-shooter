import { Ground } from "../objects/Ground";
import { SkyBox } from "../objects/SkyBox";
import { AudioListener, DirectionalLight, HemisphereLight, Scene, Vector3 } from "three";
import { Bullet } from "src/objects/bullet";
import { Player } from "src/objects/player";
import { FirstPersonController } from "src/controllers/FirstPersonController";
import { FirstPersonCamera } from "src/cameras/FirstPersonCamera";

export class GameScene extends Scene {

    private player?: Player;
    private controller?: FirstPersonController;
    constructor() {
        super();
    }

    init(audioListener: AudioListener) {
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

        const player = new Player(audioListener);
        const fpsCam = new FirstPersonCamera();
        player.setCamera(fpsCam);
        this.controller = new FirstPersonController(player, fpsCam);

        this.add(player);

        Bullet.scene = this;
    }

    update(dt) {
        this.controller?.update(dt);
        this.player?.update(dt);
        Bullet.update(dt);
    }
}