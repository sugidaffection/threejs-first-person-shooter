import { DoubleSide, Mesh, MeshBasicMaterial, Scene, Shape, ShapeGeometry, Vector2 } from "three";

export class LobbyScene extends Scene {
    constructor() {
        super();
    }

    init(audioListener: AudioListener) {
        const shape = new Shape(
            [
                new Vector2(1, 1),
                new Vector2(1, -1),
                new Vector2(-1, -1),
                new Vector2(-1, 1),
            ]
        );

        const geometry = new ShapeGeometry(shape);
        const material = new MeshBasicMaterial({
            color: 0xFF0000,
            side: DoubleSide,
            depthWrite: false
        });

        const mesh = new Mesh(geometry, material);

        this.add(mesh);
    }

    update(dt) {

    }
}