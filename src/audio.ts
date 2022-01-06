import { AudioLoader, LoadingManager } from "three";

interface AudioItem {
    name: string,
    buffer: AudioBuffer
}

class AudioManager {

    private static list: Array<any> = new Array();
    private static audioLoader: AudioLoader = new AudioLoader();

    static setLoadingManager(manager: LoadingManager): void {
        this.audioLoader.manager = manager;
    }

    static async addAudio({ name, url }: { [key: string]: string }) {
        if (this.list.some((audio: AudioItem) => audio.name == name)) throw new Error('Duplicate audio name.');
        const buffer = await this.audioLoader.loadAsync(url);
        this.list.push({ name, buffer });
    }

    static getAudioBuffer(name: string): AudioBuffer {
        if (!this.list.some((audio: AudioItem) => audio.name == name)) throw new Error(`Audio ${name} not found.`);
        return this.list.find(audio => audio.name == name).buffer;
    }

}

export { AudioManager };