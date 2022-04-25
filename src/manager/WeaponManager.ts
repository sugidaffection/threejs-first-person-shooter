import { LoadingManager, Object3D } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

interface TextureItem {
    name: string,
    obj: Object3D
}

export class WeaponManager {
    private static list: Array<TextureItem> = new Array();
    private static mtlLoader: MTLLoader = new MTLLoader();
    private static objLoader: OBJLoader = new OBJLoader();

    static setLoadingManager(manager: LoadingManager) {
        this.mtlLoader.manager = manager;
        this.objLoader.manager = manager;
    }

    static async loadWeapon({ name, materialURL, objURL }: { [key: string]: string }): Promise<void> {
        if (this.list.some(weapon => weapon.name == name)) throw new Error('Duplicate weapon name.');

        const materials = await this.mtlLoader.loadAsync(materialURL);
        materials.preload();

        const ump47 = await this.objLoader.loadAsync(objURL);
        const obj: Object3D = new Object3D();
        obj.add(ump47);

        this.list.push({ name, obj });
    }

    static getWeapon(name: string): Object3D {
        if (!this.list.some(weapon => weapon.name == name)) throw new Error(`Weapon ${name} not found.`);
        return this.list.find(weapon => weapon.name == name)!.obj;
    }

    static cloneWeapon(name: string): Object3D {
        const weapon: Object3D = this.getWeapon(name);
        return weapon.clone();
    }
}