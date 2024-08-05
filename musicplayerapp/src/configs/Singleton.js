let audioInstance = null;

export const getAudioInstance = () => {
    if (!audioInstance) {
        audioInstance = new Audio();
    }
    return audioInstance;
};