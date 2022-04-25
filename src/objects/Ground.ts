import { Box } from "cannon-es";
import { Vec3 } from "math/Vec3";
import { TextureManager } from "../manager/TextureManager";
import { BoxGeometry, DoubleSide, Mesh, MeshPhongMaterial, NearestFilter, Object3D, RepeatWrapping, Vector3 } from "three";

export class Ground extends Object3D {

    constructor(width: number, height: number, position: Vector3) {
        super();

        const material = new MeshPhongMaterial({ shadowSide: DoubleSide });
        material.map = TextureManager.getTexture('floor');
        material.map.wrapS = material.map.wrapT = RepeatWrapping;
        material.map.repeat.set(width, height);
        material.map.magFilter = NearestFilter;
        material.map.needsUpdate = true;

        const mesh = new Mesh(
            new BoxGeometry(width, height, 1),
            material
        );
        mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
        mesh.receiveShadow = true;

        // const shape = new Box(new Vec3(width / 2, height / 2, depth / 2));
        // const body = new Body({ shape, mass: 0 });
        // body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
        // body.position.copy(position)

        // mesh.position.fromArray(body.position.toArray());

        // this.world.addBody(body);
        // this.scene.add(mesh);
    }

}