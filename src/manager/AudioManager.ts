import { AudioLoader, LoadingManager } from "three";

interface AudioItem {
    name: string,
    buffer: AudioBuffer
}

class AudioManager {

    private list: Array<AudioItem>;
    private audioLoader: AudioLoader;

    onLoadProgress?: (event: ProgressEvent<EventTarget>) => void;

    constructor(
        onLoadProgress?: (event: ProgressEvent<EventTarget>) => void
    ) {
        this.list = new Array<AudioItem>();
        this.audioLoader = new AudioLoader();
        this.onLoadProgress = onLoadProgress;
    }

    setLoadingManager(manager: LoadingManager) {
        this.audioLoader.manager = manager;
    }

    onLoadProgressHandler(event: ProgressEvent<EventTarget>) {
        if (this.onLoadProgress)
            this.onLoadProgress(event);
    }

    async loadAudio({ name, url }: { [key: string]: string }): Promise<string> {
        if (this.list.some((audio: AudioItem) => audio.name == name))
            return Promise.reject(new Error('Duplicate audio name.'));
        const buffer = await this.audioLoader.loadAsync(url, this.onLoadProgressHandler);
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

export { AudioManager };