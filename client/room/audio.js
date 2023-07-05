const AUDIO_BLOCK_SIZE = 1024
const AUDIO_FIFO_MAXLEN = 4900
var audioContext
var scriptProcessor
var audioFifo0 = new Int16Array(AUDIO_FIFO_MAXLEN)
var audioFifo1 = new Int16Array(AUDIO_FIFO_MAXLEN)
var audioFifoHead = 0
var audioFifoCnt = 0
var VolumeAudio

function processAudio(event) {
    var outputBuffer = event.outputBuffer
    var audioData0 = outputBuffer.getChannelData(0)
    var audioData1 = outputBuffer.getChannelData(1)

    if ((!isRunning) ) {
        for (var i = 0; i < AUDIO_BLOCK_SIZE; i++) {
            audioData0[i] = 0
            audioData1[i] = 0
        }
        return
    }
    while (audioFifoCnt < AUDIO_BLOCK_SIZE) {
        //console.log('audio fifo underflow, running a new frame')
        emuRunFrame();
    }

    var copySize = AUDIO_BLOCK_SIZE
    if (audioFifoCnt < copySize) {
        copySize = audioFifoCnt
    }
    for (var i = 0; i < copySize; i++) {
        audioData0[i] = audioFifo0[audioFifoHead] / 32768.0
        audioData1[i] = audioFifo1[audioFifoHead] / 32768.0
        audioFifoHead = (audioFifoHead + 1) % AUDIO_FIFO_MAXLEN
        audioFifoCnt--
    }
}

// must be called in user gesture
function tryInitSound() {
    if (audioContext) {
        if (audioContext.state != 'running') {
            audioContext.resume()
        }
        return;
    }
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 0.0001, sampleRate: 48000 });
        VolumeAudio = audioContext.createGain();
        scriptProcessor = audioContext.createScriptProcessor(AUDIO_BLOCK_SIZE, 0, 2)
        scriptProcessor.onaudioprocess = processAudio
        scriptProcessor.connect(VolumeAudio).connect(audioContext.destination);

        audioContext.resume()
    } catch (e) {
        console.log(e)
        //alert('Cannnot init sound ')
    }
}



function writeAudio(ptr, frames) {
    //console.log(ptr, frames)
    /*if (turboMode) {
        return
    }*/
    if (!wasmAudioBuf) {
        wasmAudioBuf = new Int16Array(Module.HEAPU8.buffer).subarray(ptr / 2, ptr / 2 + 2048)
    }
    var tail = (audioFifoHead + audioFifoCnt) % AUDIO_FIFO_MAXLEN
    if (audioFifoCnt + frames >= AUDIO_FIFO_MAXLEN) {
        //console.log('o', audioFifoCnt)
        return
    }
    for (var i = 0; i < frames; i++) {
        audioFifo0[tail] = wasmAudioBuf[i * 2]
        audioFifo1[tail] = wasmAudioBuf[i * 2 + 1]
        tail = (tail + 1) % AUDIO_FIFO_MAXLEN
    }
    audioFifoCnt += frames
}

let volumeControl = document.getElementById("volume");
volumeControl.addEventListener(
  "input",
  () => {
    VolumeAudio.gain.value = volumeControl.value;
  },
  false
);
