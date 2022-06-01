import { AudioListener, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Shape, ShapeGeometry, Vector2, Vector3 } from "three";

export class LobbyScene extends Scene {
    private camera: PerspectiveCamera;
    private audioListener: AudioListener;
    constructor(audioListener: AudioListener) {
        super();
        this.camera = new PerspectiveCamera();
        this.audioListener = audioListener;
    }

    init() {
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
        mesh.position.z = -1;
        mesh.position.x = this.camera.position.x;
        mesh.position.y = this.camera.position.y;
        mesh.scale.multiply(new Vector3(this.camera.aspect, 1, 1));
        this.camera.lookAt(mesh.position);

        this.camera.add(mesh);
        this.add(this.camera);
    }

    update(dt) {

    }
}