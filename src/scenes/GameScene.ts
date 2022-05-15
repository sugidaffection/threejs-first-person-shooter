import { Ground } from "../objects/Ground";
import { SkyBox } from "../objects/SkyBox";
import { DirectionalLight, HemisphereLight, Scene, Vector3 } from "three";

export class GameScene extends Scene {
    constructor() {
        super();

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
    }
}