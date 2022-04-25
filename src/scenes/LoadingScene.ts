import { BoxGeometry, Camera, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, PlaneGeometry, Scene, Vector3, WebGLRenderer } from "three";

export class LoadingScene extends Scene {

    cube: Mesh;
    constructor() {
        super();

        let geo: BoxGeometry = new BoxGeometry(1, 1, 1);
        let mat = new MeshBasicMaterial({ color: 0x00ff00 });
        let mesh = new Mesh(
            geo, mat
        );
        mesh.position.setZ(-5);
        // this.add(mesh);
        // this.cube = mesh;

        let bar: PlaneGeometry = new PlaneBufferGeometry(1, .2, 1);
        let barmesh = new Mesh(
            bar, mat
        )

        barmesh.position.setZ(-1);
        // barmesh.rotation.z -= 1;

        this.add(barmesh);

        let progress: PlaneGeometry = new PlaneBufferGeometry(.1, .2, 1);
        let promesh = new Mesh(progress, new MeshBasicMaterial({ color: 0xffff00 }));
        promesh.position.setZ(-1);
        promesh.position.setX(-.5);

        promesh.scale.x = 1.5;

        this.add(promesh);


        this.cube = promesh;

    }

    update() {
        // this.cube.scale.x += .01;
        // this.cube.position.x = .0005;
        // this.cube.rotation.x -= .01;
        // this.cube.rotation.y += .01;

    }
}