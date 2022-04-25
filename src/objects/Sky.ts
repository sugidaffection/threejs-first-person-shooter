import { TextureManager } from "../manager/TextureManager";
import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D } from "three";

export class Sky extends Object3D {

    constructor() {
        super();
        const mesh = new Mesh(
            new BoxGeometry(1000, 1000, 1000),
            new MeshBasicMaterial({ map: TextureManager.getTexture('sky'), side: DoubleSide })
        )

        this.add(mesh);
    }

}