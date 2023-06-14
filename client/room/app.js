
function $id(id) {
    return document.getElementById(id);
}
if (!window.WebAssembly) {
    alert('Sorry, your browser does not support WebAssembly. :(')
}


var isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var isWebApp = navigator.standalone || false
var isSaveSupported = true
if (isIOS) {
    //document.getElementById('romFile').files = null;
    if (!isWebApp) {
        // On iOS Safari, the indexedDB will be cleared after 7 days. 
        // To prevent users from frustration, we don't allow savegaming on iOS unless the we are in the PWA mode.
        isSaveSupported = false
        alert('Due to limitations of iOS, please add this page to the home screen and launch it from the home screen icon to enable features including savegame and full screen.')
        var divIosHint = document.getElementById('ios-hint')
        divIosHint.hidden = false
        divIosHint.style = 'position: absolute; bottom: ' + divIosHint.clientHeight + 'px;'
    }
}

const AUDIO_BLOCK_SIZE = 1024
const AUDIO_FIFO_MAXLEN = 4900
var audioContext
var scriptProcessor
var audioFifo0 = new Int16Array(AUDIO_FIFO_MAXLEN)
var audioFifo1 = new Int16Array(AUDIO_FIFO_MAXLEN)
var audioFifoHead = 0
var audioFifoCnt = 0

var fileInput = document.getElementById('romFile')
var canvas = document.getElementById('gba-canvas')
var drawContext = canvas.getContext('2d')
var romBuffer = -1
var idata
var isRunning = false
var isWasmReady = false
var wasmAudioBuf
var wasmSaveBuf
const wasmSaveBufLen = 0x20000 + 0x2000
var tmpSaveBuf = new Uint8Array(wasmSaveBufLen)

var frameCnt = 0
var last128FrameTime = 0
var lastFrameTime = 0
var frameSkip = 0
var lowLatencyMode = false

var lastCheckedSaveState = 0

var gameID
var romFileName

var turboMode = false
var turboInterval = -1

var gbaWidth
var gbaHeight
var cheatCode

var isStarted = false
var showMsgStop

const inputs = new L3GBAInputs()
inputs.init()

function processAudio(event) {
    var outputBuffer = event.outputBuffer
    var audioData0 = outputBuffer.getChannelData(0)
    var audioData1 = outputBuffer.getChannelData(1)

    if ((!isRunning) || (turboMode)) {
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
        scriptProcessor = audioContext.createScriptProcessor(AUDIO_BLOCK_SIZE, 0, 2)
        scriptProcessor.onaudioprocess = processAudio
        scriptProcessor.connect(audioContext.destination)

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

function wasmReady() {
    romBuffer = Module._emuGetSymbol(1)
    var ptr = Module._emuGetSymbol(2)
    wasmSaveBuf = Module.HEAPU8.subarray(ptr, ptr + wasmSaveBufLen)
    ptr = Module._emuGetSymbol(3)
    idata = new ImageData(new Uint8ClampedArray(Module.HEAPU8.buffer).subarray(ptr, ptr + 240 * 160 * 4), 240, 160)

    isWasmReady = true
    let romLoad = document.getElementById("rom-load")
    romLoad.innerText="Load ROM"
    romLoad.onclick=function(){
        document.getElementById("romFile").click()
    }
}

function loadSaveGame(index, cb) {
    console.log('load', gameID, index)
    localforage.getItem('gba-' + gameID + '-save-' + index, function (err, data) {
        //console.log(err, data)
        if (data) {
            wasmSaveBuf.set(data)
            clearSaveBufState()
            cb(true)
        } else {
            clearSaveBufState()
            cb(false)
        }
    })
}

function saveSaveGame(index, cb) {
    console.log('save', gameID, index)
    tmpSaveBuf.set(wasmSaveBuf)
    localforage.setItem('gba-' + gameID + '-save-' + index, tmpSaveBuf, function (err, data) {
        cb(true)
    })
}

function savBackupBtn() {
    var blob = new Blob([wasmSaveBuf], { type: "application/binary" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = 'save-' + gameID + '.4gs';
    link.click();
}

function savRestoreBtn() {
    var file = document.getElementById('sav-file').files[0]
    if (file) {
        var fileReader = new FileReader()
        fileReader.onload = function (event) {
            var arrayBuffer = event.target.result
            var u8 = new Uint8Array(arrayBuffer)
            wasmSaveBuf.set(u8)
            alert('sav file loaded')
            Module._emuResetCpu()
            clearSaveBufState()
        };
        fileReader.readAsArrayBuffer(file)
    }
}

function applyCheatCode() {
    var ptrGBuf = Module._emuGetSymbol(4)
    var gbuf = Module.HEAPU8.subarray(ptrGBuf, ptrGBuf + 0x1000)
    var lines = cheatCode.split('\n')
    var textEnc = new TextEncoder()
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim()
        if (line.length == 0) {
            continue
        }
        if (line.length == 12) {
            line = line.substr(0, 8) + ' ' + line.substr(8, 4)
        }
        var lineBuf = textEnc.encode(line)
        console.log(lineBuf.length)
        gbuf.set(lineBuf)
        gbuf[lineBuf.length] = 0
        console.log(Module._emuAddCheat(ptrGBuf))
    }
}

function loadRomArrayBuffer(arrayBuffer) {
    isRunning = false
    var u8 = new Uint8Array(arrayBuffer)
    gameID = ""
    if (u8[0xB2] != 0x96) {
        alert('Not a valid GBA ROM!')
        return
    }
    for (var i = 0xAC; i < 0xB2; i++) {
        console.log(u8[i])
        gameID += String.fromCharCode(u8[i])
    }
    if ((u8[0xAC] == 0) || (gameID.substr(0, 4) == '0000')) {
        // a homebrew! use file name as id
        gameID = romFileName
    }
    console.log('gameID', gameID)
    Module.HEAPU8.set(u8, romBuffer)
    cheatCode = localStorage['cht-' + gameID] 
    if (cheatCode) {
        $id('txt-code').value = cheatCode
    }     
    var ret = Module._emuLoadROM(u8.length)
    //now i can wait for the sync
    let btnChoose = document.getElementById('rom-load')
    btnChoose.classList.add("valid");
    btnChoose.innerText="Valid ROM"
    let btnReady = document.getElementById('ready')
    btnReady.hidden = false
    
}

function startEmulation(){
    isStarted=true
	document.getElementById('menu').hidden = true
	document.getElementById('pause').hidden = false
    loadSaveGame(0, function () {
        Module._emuResetCpu()
        //applyCheatCode()
        //alert('cheat code loaded')
        //removed cheating ability so far
        
        
        isRunning = true
        
    })
}

function onHomebrewListSelected() {
    if (!isWasmReady) {
        alert('WASM not ready!')
        return
    }
    tryInitSound()
    var fn = document.getElementById('homebrew-list').value
    if (fn == '') {
        return
    }
    romFileName = fn
    document.getElementById('select-rom').innerText = 'Downloading...'
    fetch('roms/' + fn + '.gba').then(function (resp) {
        resp.arrayBuffer().then(function (ab) {
            loadRomArrayBuffer(ab)
        })
    });
}

function onFileSelected() {
    if (!isWasmReady) {
        alert('WASM not ready!')
        return
    }
    tryInitSound()
    var file = fileInput.files[0]
    var fileNameLower = file.name.toLowerCase()
    if (!fileNameLower.endsWith('.gba')) {
        alert('Please select a .gba file.')
        return
    }
    if (file) {
        romFileName = file.name
        var arrayBuffer
        var fileReader = new FileReader()
        fileReader.onload = function (event) {
            var arrayBuffer = event.target.result
            loadRomArrayBuffer(arrayBuffer)
        };
        fileReader.readAsArrayBuffer(file)
    }

}


function emuRunFrame() {
    inputs.processGamepadInput()
    if (isRunning) {
        frameCnt++
        if (frameCnt % 60 == 0) {
            checkSaveBufState()
        }
        if (frameCnt % 128 == 0) {

            if (last128FrameTime) {
                var diff = performance.now() - last128FrameTime
                var frameInMs = diff / 128
                var fps = -1
                if (frameInMs > 0.001) {
                    fps = 1000 / frameInMs
                }
                console.log('fps', fps)
            }
            last128FrameTime = performance.now()

        }
        lastFrameTime = performance.now()
        Module._emuRunFrame(inputs.getVKState());
        drawContext.putImageData(idata, 0, 0);
    }
}


function emuLoop() {
    window.requestAnimationFrame(emuLoop)
    emuRunFrame()
}
emuLoop()


function adjustSize() {
    var gbaMaxWidth = window.innerWidth
    var gbaMaxHeight = window.innerHeight - 20
    var l = 0
    var w = gbaMaxWidth
    var h = w / 240 * 160
    if (h > gbaMaxHeight) {
        h = gbaMaxHeight
        w = h / 160 * 240
    }
    var scaleFator = (w / 240) // | 0
    gbaWidth = 240 * scaleFator
    gbaHeight = 160 * scaleFator
    l += (window.innerWidth - gbaWidth) / 2;
    canvas.style = 'width:' + gbaWidth + 'px;height:' + gbaHeight + 'px;left:' + l + 'px;'
    inputs.adjustVKLayout()
}

window.onresize = adjustSize
window.onorientationchange = adjustSize
adjustSize()



function checkSaveBufState() {
    if (!isRunning) {
        return;
    }
    var state = Module._emuUpdateSavChangeFlag()
    //console.log(state)
    if ((lastCheckedSaveState == 1) && (state == 0) && (isSaveSupported)) {
        showMsg('Auto saving, please wait...')
        saveSaveGame(0, function () {
            console.log('save done')
        })
    }
    lastCheckedSaveState = state
}

function clearSaveBufState() {
    lastCheckedSaveState = 0
    Module._emuUpdateSavChangeFlag()
}


function showMsg(msg, time) {
    let timeShown = time || 1000
    document.getElementById('notif-msg').innerText = msg
    document.getElementById('notif').hidden = false
    showMsgStop = setTimeout(function () {
        document.getElementById('notif').hidden = true
        //prevents messages from annoying each others.
        clearTimeout(showMsgStop)
    }, timeShown)
}

function setTurboMode(t) {
    t = t ? true : false
    if (turboMode == t) {
        return
    }
    if (t) {
        turboInterval = setInterval(emuRunFrame, 2)
    } else {
        clearInterval(turboInterval)
    }
    turboMode = t
}
/*
    @t bool pause state
    @broadcast bool, relay to other client or not
*/
function setPauseMenu(t, broadcast) {
	if(t && broadcast){
		socket.send("o")
	}else if(!t  && broadcast){
		socket.send("f")
	}
    if (!t) {
        // Save cheat code
        var cheatCode = filterCheatCode($id('txt-code').value)
        if ((localStorage['cht-' + gameID] || '') != cheatCode) {
            localStorage['cht-' + gameID] = cheatCode
            showMsg('Cheat code saved. Restart the app to apply.')
        }
    }
    t = t ? true : false
    isRunning = !t && isStarted
    document.getElementById('menu').hidden = !t
    document.getElementById('pause').hidden = t
}

localforage.ready().then(function () { }).catch(function (err) {
    alert('Save storage not supported: ' + err);
})

function chtWriteBtn() {
    var addr = parseInt(document.getElementById('cht-addr').value)
    if (!addr) {
        alert('Invalid addr'); return
    }
    Module._writeU32(addr,
        parseInt(document.getElementById('cht-value').value))


}

function chtReadBtn() {
    var addr = parseInt(document.getElementById('cht-addr').value)
    if (!addr) {
        alert('Invalid addr'); return
    }
    var val = Module._readU32(addr) >>> 0
    document.getElementById('cht-value').value = '0x' + val.toString(16)
}

window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected")
});


$id('txt-code').placeholder = 'Cheat code:\nGameshark: XXXXXXXXYYYYYYYY\nAction Replay: XXXXXXXX YYYY'

function filterCheatCode(code) {
    var lines = code.split('\n')
    var ret = ''
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim().replace(/ /g, '')
        if ((line.length != 16) && (line.length != 12)) {
            continue
        }
        // Check if it's a hex string
        if (line.match(/[^0-9A-F]/)) {
            continue
        }
        ret += line + '\n'
    }
    return ret
}



{   //leave the room
    let leaveRoom = document.getElementById("leave")
    leaveRoom.onclick=function(){
        window.location.href="/"
    }
}

{ //pause to menu
    
    document.getElementById("pause").onclick=function(){
        //this prevents to trigger pause again in a sort of vicious lopp 
        setPauseMenu(true, true)
    }
}

{ //menu to continue
    document.getElementById("return").onclick=function(){
        //this prevents to trigger pause again in a sort of vicious loop  
        setPauseMenu(false, true)
    }
}