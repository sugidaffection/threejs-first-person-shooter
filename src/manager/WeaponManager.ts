import { LoadingManager, Object3D } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

interface TextureItem {
    name: string,
    obj: Object3D
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

    async loadWeapon({ name, materialURL, objURL }: { [key: string]: string }): Promise<string> {
        if (this.list.some(weapon => weapon.name == name))
            return Promise.reject(new Error('Duplicate weapon name.'));

        const materials = await this.mtlLoader.loadAsync(materialURL, this.onLoadProgressHandler);
        if (!materials)
            return Promise.reject(new Error(`Failed to load material ${materialURL}`))
        materials.preload();

        const ump47 = await this.objLoader.loadAsync(objURL, this.onLoadProgressHandler);
        if (!ump47)
            return Promise.reject(new Error(`Failed to load Object ${objURL}`))

        const obj: Object3D = new Object3D();
        obj.add(ump47);

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