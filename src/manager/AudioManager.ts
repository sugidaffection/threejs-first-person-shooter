import { AudioLoader } from "three";
import { BaseLoadingManager, SingletonFn } from "./Manager";

interface AudioItem {
    name: string,
    buffer: AudioBuffer
}

export class AudioManager extends BaseLoadingManager {

    private list: Array<AudioItem>;
    private audioLoader: AudioLoader;

    constructor() {
        super();
        this.list = new Array<AudioItem>();
        this.audioLoader = new AudioLoader();
    }

    async loadAudio({ name, url }: { [key: string]: string }): Promise<string> {
        if (this.list.some((audio: AudioItem) => audio.name == name))
            return Promise.reject(new Error('Duplicate audio name.'));
        const buffer = await this.audioLoader.loadAsync(url, this.onLoadHandler.bind(this));
        if (!buffer)
            return Promise.reject(new Error(`Failed to load audio ${name}`))
        this.list.push({ name, buffer });
        return Promise.resolve(`Audio loaded ${name}`);
    }

    getAudioBuffer(name: string): AudioBuffer {
        if (!this.list.some((audio: AudioItem) => audio.name == name))
            throw new Error(`Audio ${name} not found.`);
        return this.list.find((audio: AudioItem) => audio.name == name)!.buffer;
    }

}

export const audioManager = SingletonFn(AudioManager);