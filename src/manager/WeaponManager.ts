import { Group, LoadingManager, Object3D, ObjectLoader } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface TextureItem {
    name: string,
    obj: Group | Object3D
}

export class WeaponManager {
    private list: Array<TextureItem>;
    private mtlLoader: MTLLoader;
    private objLoader: OBJLoader;

    onLoadProgress?: (event: ProgressEvent<EventTarget>) => void;

    constructor(
        onLoadProgress?: (event: ProgressEvent<EventTarget>) => void
    ) {
        this.list = new Array<TextureItem>();
        this.mtlLoader = new MTLLoader();
        this.objLoader = new OBJLoader();

        this.onLoadProgress = onLoadProgress;
    }

    setLoadingManager(manager: LoadingManager) {
        this.mtlLoader.manager = manager;
        this.objLoader.manager = manager;
    }

    onLoadProgressHandler(event: ProgressEvent<EventTarget>) {
        if (this.onLoadProgress)
            this.onLoadProgress(event);
    }

    async loadWeapon({ name, objURL, materialURL }: { [key: string]: string }): Promise<string> {
        if (this.list.some(weapon => weapon.name == name))
            return Promise.reject(new Error('Duplicate weapon name.'));

        // if (materialURL) {
        //     const materials = await this.mtlLoader.loadAsync(materialURL, this.onLoadProgressHandler);
        //     if (!materials)
        //         return Promise.reject(new Error(`Failed to load material ${materialURL}`))
        //     materials.preload();
        //     this.objLoader.setMaterials(materials);
        // }

        let gltf: Object3D | null = null;

        try {
            gltf = await this.objLoader.loadAsync(objURL, this.onLoadProgressHandler);

        } catch (er) {
            console.log(er);
            return Promise.reject(new Error(`Failed to load Object ${er}`))
        }

        console.log(gltf);

        // if (!gltf)
        // const obj: Object3D = new Object3D();
        // obj.add(weapon);


        const obj = gltf;

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