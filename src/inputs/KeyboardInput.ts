interface InputKeys {
    [key: string]: string;
}
export class KeyboardInput {
    private keys: InputKeys;

    constructor() {
        this.keys = {};
    }

    inputEventHandler(e: KeyboardEvent) {
        this.keys[e.code] = e.type;
    }

    private getInputKey(name: string) {
        if (Object.keys(this.keys).some(key => key == name))
            return this.keys[name];
        return false;
    }

    getInput(name: string) {
        return this.getInputKey(name) == 'keydown';
    }

    getPress(name: string) {
        return this.getInputKey(name) == 'keypress';
    }
}