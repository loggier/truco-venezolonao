
// Web Audio API context
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

// Initialize context on first user interaction to comply with browser autoplay policies
const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

export const playCardSound = () => {
    initAudio();
    if (!audioCtx) return;

    // Create a buffer for white noise (simulating paper sliding)
    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms duration
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // White noise
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound more like "paper" (Lowpass)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    // Envelope (Attack and Release)
    const gain = audioCtx.createGain();
    // Start silence
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    // Fast attack
    gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.01);
    // Exponential decay to silence
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
};

export const playShuffleSound = () => {
    // A quick sequence of card sounds
    setTimeout(() => playCardSound(), 0);
    setTimeout(() => playCardSound(), 100);
    setTimeout(() => playCardSound(), 200);
};

// New: accept 'isCpu' to change voice characteristics
export const speak = (text: string, isCpu: boolean = false) => {
    if (!window.speechSynthesis) return;
    
    // Cancel previous speech to avoid lag
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to select a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    
    // Strategy: Prefer different voices if available, otherwise use Pitch/Rate
    // Venezuelan/Mexican voices preferred
    const latinVoices = voices.filter(v => v.lang.includes('es-VE') || v.lang.includes('es-MX') || v.lang.includes('es-AR'));
    const generalSpanish = voices.filter(v => v.lang.startsWith('es'));
    
    const available = latinVoices.length > 0 ? latinVoices : generalSpanish;

    if (available.length > 0) {
        // Try to pick different voices for CPU and Player if possible
        if (available.length >= 2) {
             utterance.voice = isCpu ? available[0] : available[1];
        } else {
             utterance.voice = available[0];
        }
    }

    // Voice Characterization
    if (isCpu) {
        utterance.pitch = 0.7; // Deeper voice for CPU
        utterance.rate = 0.9;  // Slower, more calculated
    } else {
        utterance.pitch = 1.1; // Normal/Slightly higher for Player
        utterance.rate = 1.1;  // Normal pace
    }

    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
};

// Pre-load voices (Chrome requires this listener)
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
    };
}
