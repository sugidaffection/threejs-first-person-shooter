import { Group, Object3D } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { BaseLoadingManager, SingletonFn } from "./Manager";

interface TextureItem {
    name: string,
    obj: Group | Object3D
}

export class WeaponManager extends BaseLoadingManager {
    private list: Array<TextureItem>;
    private mtlLoader: MTLLoader;
    private objLoader: OBJLoader;

    onLoadProgress?: (event: ProgressEvent<EventTarget>) => void;

    constructor() {
        super();
        this.list = new Array<TextureItem>();
        this.mtlLoader = new MTLLoader();
        this.objLoader = new OBJLoader();
    }

    async loadWeapon({ name, objURL, materialURL }: { [key: string]: string }): Promise<string> {
        if (this.list.some(weapon => weapon.name == name))
            return Promise.reject(new Error('Duplicate weapon name.'));

        if (materialURL) {
            const materials = await this.mtlLoader.loadAsync(materialURL, this.onLoadHandler.bind(this));
            if (!materials)
                return Promise.reject(new Error(`Failed to load material ${materialURL}`))
            materials.preload();
            this.objLoader.setMaterials(materials);
        }

        let obj: Object3D | null = null;

        try {
            obj = await this.objLoader.loadAsync(objURL, this.onLoadHandler.bind(this));
        } catch (er) {
            console.log(er);
            return Promise.reject(new Error(`Failed to load Object ${er}`))
        }

        this.list.push({ name, obj });

        return Promise.resolve(`Weapon loaded ${name}`);
    }

    getWeapon(name: string): Object3D {
        if (!this.list.some(weapon => weapon.name == name)) throw new Error(`Weapon ${name} not found.`);
        return this.list.find(weapon => weapon.name == name)!.obj;
    }

    cloneWeapon(name: string): Object3D {
        const weapon: Object3D = this.getWeapon(name);
        return weapon.clone();
    }
}

export const weaponManager = SingletonFn(WeaponManager);