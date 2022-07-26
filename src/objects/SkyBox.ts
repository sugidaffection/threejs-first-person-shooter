import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D, RepeatWrapping } from "three";
import { assetManager } from "../manager/AssetManager";

export class SkyBox extends Object3D {

    constructor() {
        super();
        let texture = assetManager.getTexture('skybox');
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(1 / 4, 1 / 3);

        let up = texture.clone();
        up.needsUpdate = true;
        up.offset.x = (1 % 4) / 4;
        up.offset.y = (2 % 3) / 3;

        let down = up.clone();
        down.needsUpdate = true;
        down.offset.y = (3 % 3) / 3;

        let back = texture.clone();
        back.needsUpdate = true;
        back.offset.x = (0 % 4) / 4;
        back.offset.y = (1 % 3) / 3;

        let left = back.clone();
        left.needsUpdate = true;
        left.offset.x = (1 % 4) / 4;

        let front = back.clone();
        front.needsUpdate = true;
        front.offset.x = (2 % 4) / 4;

        let right = back.clone();
        right.needsUpdate = true;
        right.offset.x = (3 % 4) / 4;


        const mesh = new Mesh(
            new BoxGeometry(1000, 1000, 1000),
            [
                new MeshBasicMaterial({ map: front, side: DoubleSide }),
                new MeshBasicMaterial({ map: back, side: DoubleSide }),
                new MeshBasicMaterial({ map: up, side: DoubleSide }),
                new MeshBasicMaterial({ map: down, side: DoubleSide }),
                new MeshBasicMaterial({ map: left, side: DoubleSide }),
                new MeshBasicMaterial({ map: right, side: DoubleSide }),
            ]
        )


        this.add(mesh);
    }

}