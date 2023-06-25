class L3GBAInputs{
    constructor(){
        this.keyState={}
        this.keyList = ["a", "b", "select", "start", "right", "left", 'up', 'down', 'r', 'l', 'menu', 'turbo'];
        this.keymap = [88, 90, 16, 13, 39, 37, 38, 40, 87, 81, 27, 84] // z x shift enter right left up down w q
        this.keycodemap= ["z", "w", "shift","enter", "right","left","up","down", "x", "a" ,"Escape", "t"]
        this.currentConnectedGamepad = -1
        this.gamePadKeyMap = {
            a: 1,
            b: 0,
            //x: 3,
            //y: 2,
            l: 4,
            r: 5,
            'select': 8,
            'start': 9,
            'up': 12,
            'down': 13,
            'left': 14,
            'right': 15
        }
        this.keyChange=-1
    }
    init(){
        // fetch config from local host
        this.fetchConfig()
        // init event listeners 
        this.initVK()
        this.initKB()
        this.initGP()
    }
    fetchConfig(){
        let keybinds = localStorage.getItem('gba-keybinds')
        if(!keybinds){
            return
        }
        //geeee i wish there was a cleaner way to do that
        keybinds = keybinds.split(',')
        for(let i=0; i<keybinds.length;i++){
            this.keymap[i]=Number(keybinds[i])
        }
        let keycodemap = localStorage.getItem('gba-keycodemap')
        if(!keycodemap){
            return
        }
        keycodemap = keycodemap.split(',')
        for(let i=0; i<keycodemap.length;i++){
            this.keycodemap[i]=keycodemap[i]
        }
    }
    saveConfig(){
        localStorage.setItem('gba-keybinds', this.keymap)
        localStorage.setItem('gba-keycodemap', this.keycodemap)
    }
    initVK() {
        var vks = document.getElementsByClassName('vk')
        for (var i = 0; i < vks.length; i++) {
            var vk = vks[i]
            var k = vk.getAttribute('data-k') //a, left, turbo...
            this.keyState[k] = [vk, 0, 0]
        }
        ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'touchenter', 'touchleave'].forEach((val) => {
            window.addEventListener(val, (e)=>{this.handleTouch(e)})
        })
        
        document.getElementById('vk-layer').ontouchstart = (e) => {
            e.preventDefault()
        }
    }
    initKB(){
        this.keymapButtons()
        document.onkeydown = (e)=>{this.normalKeyDown(e)}
        document.onkeyup = (e)=>{this.normalKeyUp(e)}
    }
    initGP(){
        window.addEventListener("gamepadconnected", function (e) {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
            showMsg('Gamepad connected.')
            this.currentConnectedGamepad = e.gamepad.index
        });
        
    }
    processGamepadInput() {
        if (this.currentConnectedGamepad < 0 || this.currentConnectedGamepad == undefined) {
            return
        }
        var gamepad = navigator.getGamepads()[this.currentConnectedGamepad]
        if (!gamepad) {
            showMsg('Gamepad disconnected.')
            this.currentConnectedGamepad = -1
            return
        }
        for (var k in this.keyState) {
            if(this.keyState[k][1]!=0){
                this.setKeyState(k,1,0,true)
            }else{
                this.setKeyState(k,1,0,false)
            }
        }
        for (var k in this.gamePadKeyMap) {
            var btn = this.gamePadKeyMap[k]
            if (gamepad.buttons[btn].pressed) {
                this.setKeyState(k,1,1,true)
            }
        }
        // Axes
        if (gamepad.axes[0] < -0.5) {
            this.setKeyState('left',1,1,true)
        } else if (gamepad.axes[0] > 0.5) {
            this.setKeyState('right',1,1,true)
        }
        if (gamepad.axes[1] < -0.5) {
            this.setKeyState('up',1,1,true)
        } else if (gamepad.axes[1] > 0.5) {
            this.setKeyState('down',1,1,true)
        }
    }
    handleTouch(event){
        tryInitSound()
        
        if (!isRunning) {
            return
        }
        event.preventDefault();
        event.stopPropagation();

        document.getElementById('vk-layer').hidden = false
        for (var k in this.keyState) {
            if(this.keyState[k][2]!=0){
                this.setKeyState(k,2,0,true)
            }else{
                this.setKeyState(k,2,0,false)
            }
        }
        
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            var dom = document.elementFromPoint(t.clientX, t.clientY)
            if (dom) {
                var k = dom.getAttribute('data-k')
                if (k) {
                    if (k == 'ul') {
                        this.setKeyState("up",2,1,true)
                        this.setKeyState("left",2,1,true)
                    } else if (k == 'ur') {
                        this.setKeyState("up",2,1,true)
                        this.setKeyState("right",2,1,true)
                    } else if (k == 'dl') {
                        this.setKeyState("down",2,1,true)
                        this.setKeyState("left",2,1,true)
                    } else if (k == 'dr') {
                        this.setKeyState("down",2,1,true)
                        this.setKeyState("right",2,1,true)
                    }else{
                        this.setKeyState(k,2,1,true)
                    }
                }
            }
        }
        if (this.keyState['menu'][2]) {
            setPauseMenu(true, true)
        }
        if (this.keyState['turbo'][2] != this.keyState['turbo'][1]) {
            setTurboMode(this.keyState['turbo'][2])
        }
        for (var k in this.keyState) {
            if (this.keyState[k][1] != this.keyState[k][2]) {
                var dom = this.keyState[k][0]
                this.keyState[k][1] = this.keyState[k][2]
                if (this.keyState[k][1]) {
                    dom.classList.add('vk-touched')
                } else {
                    dom.classList.remove('vk-touched')
                }

            }
        }
    }
    
    getVKState() {
        var ret = 0;
        for (var i = 0; i < 10; i++) {
            ret = ret | (this.keyState[this.keyList[i]][1] << i);
        }
        return ret;
    }
    makeVKStyle(top, left, w, h, fontSize) {
        return 'top:' + top + 'px;left:' + left + 'px;width:' + w + 'px;height:' + h + 'px;' + 'font-size:' + fontSize + 'px;line-height:' + h + 'px;'
    }
    
    
    adjustVKLayout() {
        var isLandscape = window.innerWidth > window.innerHeight
        var baseSize = Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.14, 50)
        var fontSize = baseSize * 0.7
        var offTop = 0
        var offLeft = 0
    
        if (!isLandscape) {
            offTop = gbaHeight + baseSize
            if ((offTop + baseSize * 7) > window.innerHeight) {
                offTop = 0
            }
        }
    
        var vkw = baseSize * 3
        var vkh = baseSize
    
        this.keyState['l'][0].style =  this.makeVKStyle(offTop + baseSize * 1.5, 0, vkw, vkh, fontSize)
        this.keyState['r'][0].style =  this.makeVKStyle(offTop + baseSize * 1.5, window.innerWidth - vkw, vkw, vkh, fontSize)
    
        vkh = baseSize * 0.5
        this.keyState['turbo'][0].style =  this.makeVKStyle(offTop + baseSize * 0.5, 0, vkw, vkh, fontSize)
        this.keyState['menu'][0].style =  this.makeVKStyle(offTop + baseSize * 0.5, window.innerWidth - vkw, vkw, vkh, fontSize)
    
        vkh = baseSize
        vkw = baseSize
        offTop += baseSize * 3
        /*
        offLeft = isLandscape ? (baseSize * 1) : 0
        if (baseSize * 6 > window.innerWidth) {
            offLeft = 0
        }*/
        offLeft = 0
    
        this.keyState['up'][0].style =  this.makeVKStyle(offTop, offLeft + vkw, vkw, vkh, fontSize)
        this.keyState['ul'][0].style =  this.makeVKStyle(offTop, offLeft, vkw, vkh, fontSize)
        this.keyState['ur'][0].style =  this.makeVKStyle(offTop, offLeft + vkw * 2, vkw, vkh, fontSize)
        this.keyState['down'][0].style =  this.makeVKStyle(offTop + vkh * 2, offLeft + vkw, vkw, vkh, fontSize)
        this.keyState['dl'][0].style =  this.makeVKStyle(offTop + vkh * 2, offLeft, vkw, vkh, fontSize)
        this.keyState['dr'][0].style =  this.makeVKStyle(offTop + vkh * 2, offLeft + vkw * 2, vkw, vkh, fontSize)
        this.keyState['left'][0].style =  this.makeVKStyle(offTop + vkh, offLeft + 0, vkw, vkh, fontSize)
        this.keyState['right'][0].style =  this.makeVKStyle(offTop + vkh, offLeft + vkw * 2, vkw, vkh, fontSize)
        let abSize = vkw * 1.3
        this.keyState['a'][0].style =  this.makeVKStyle(offTop + vkh - baseSize * 0.5, window.innerWidth - abSize, abSize, abSize, fontSize)
        this.keyState['b'][0].style =  this.makeVKStyle(offTop + vkh, window.innerWidth - abSize * 2.4, abSize, abSize, fontSize)
    
        vkh = baseSize * 0.5
        vkw = baseSize * 3
    
        offLeft = (window.innerWidth - vkw * 2.2) / 2
        offTop += baseSize * 3 + baseSize * 0.5
        if (isLandscape) {
            offTop = window.innerHeight - vkh
        }
    
        this.keyState['select'][0].style =  this.makeVKStyle(offTop, offLeft, vkw, vkh, fontSize)
        this.keyState['start'][0].style =  this.makeVKStyle(offTop, offLeft + vkw * 1.2, vkw, vkh, fontSize)
    
    
    }

    broadcast(downOrUp,k){
        var DoU
        if(downOrUp == undefined || k == undefined){
            console.warn("missing param broadcast")
            return
        }
        else if(downOrUp=="d" || downOrUp==1){
            DoU="d"
        }else if(downOrUp=="u" || downOrUp==0){
            DoU="u"
        }else{
            console.warn("bad input broadcast DoU:",downOrUp)
            return
        }
        if(k<0||k>12){
            console.warn("bad input broadcast k:", k)
        }
        socket.send(DoU+k)
    }

    convertKeyCode(keyCode) {
        // const keyList = ["a", "b", "select", "start", "right", "left", 'up', 'down', 'r', 'l', 'menu', 'turbo'];
        //8bitdo Zero2 in Keyboard Mode
        for (var i = 0; i < this.keymap.length; i++) {
            if (keyCode == this.keymap[i]) {
                return i
            }
        }
        return -1
    }
    convertKeyString(keyString){
        //["a", "b", "select", "start", "right", "left", 'up', 'down', 'r', 'l'];
        switch(keyString){
            case "a":
                return 0
            case "b":
                return 1
            case "select":
                return 2
            case "start":
                return 3
            case "right":
                return 4
            case "left":
                return 5
            case "up":
                return 6
            case "down":
                return 7
            case "r":
                return 8
            case "l":
                return 9
            case "menu":
                return 10
            case "turbo":
                return 11
        }
    }
    /*
    @k could be -1<int<11 or string 'left', 'top' 'a'
    @index index of the keystate array
    @value, int 1or0 string "down" or "up"
    @flag, if false don't broadcast

    */
    setKeyState(k, index, value, flag){
        console.log(k)
        if(k == undefined || index == undefined || value == undefined){
            console.warn("missuse of the L3GBAInputs::Keystate bad params: \
            k:%s , i:%s , val:%s", k, index, value)
            return
        }
        if(typeof k == 'number'){
            if(k==10){
                setPauseMenu(true)
            }
            if(k==11){
                setTurboMode(value)
            }
            console.log(this.keyState, this.keyList, k, index)
            this.keyState[this.keyList[k]][index] = value
            
        }else if(typeof k == 'string'){
            if(k=='menu'){
                setPauseMenu(true)
            }
            if(k=='turbo'){
                setTurboMode(value)
            }
            this.keyState[k][index] = value
            k = this.convertKeyString(k)
        }else{
            //wtf
            console.warn("who just sent an object as k, are you mad?")
            return
        }
        if(flag){
            this.broadcast(value, k)
        }
        
    }
    normalKeyDown(e){
        //tryInitSound()
        if (!isRunning) {
            return
        }
        e.preventDefault()
        
        var k = this.convertKeyCode(e.keyCode)
        if (k >= 0) {
            this.setKeyState(k,1,1,true)
        }
    }
    
    normalKeyUp=(e)=> {
        //console.log(e.key, e.keyCode)
        if (!isRunning) {
            return
        }
        e.preventDefault()

        var k = this.convertKeyCode(e.keyCode)
        if (k >= 0) {
            this.setKeyState(k,1, 0,true)
        }
    }

    hookKey(e){
        this.keymap[this.keyChange]=e.keyCode
        this.keycodemap[this.keyChange]=e.key
        document.getElementById("kb-settings").children[0].innerText="Keybind settings"
        this.saveConfig()
        this.keymapButtons()
        document.onkeydown = (e)=>{this.normalKeyDown(e)}
        document.onkeyup = (e)=>{this.normalKeyUp(e)}
    }
    
    keymapButtons(){
        let btnsKeyChange=document.getElementsByClassName("btn-set-key")
        for(let i=0;i<btnsKeyChange.length;i++){
            let btn=btnsKeyChange[i]
            btn.onclick=(e)=>{this.setBtn(e)}
            let regex= /\([^\(]+\)$/i
            btn.innerText=btn.innerText.replace(regex,"")
            let j = this.convertKeyString(btn.getAttribute("data-key"))
            btn.innerText=btn.innerText+" ("+this.keycodemap[j]+")"
        }
    }
    setBtn(ev){
        document.getElementById("kb-settings").children[0].innerText="Press a key"
        var keyChange=-1
        switch(ev.target.getAttribute("data-key")){
        case 'a': 
        keyChange=0
        break;
        case 'b':
        keyChange=1
        break;
        case 'select':
        keyChange=2
        break;
        case 'start':
        keyChange=3
        break;
        case 'right':
        keyChange=4
        break;
        case 'left':
        keyChange=5
        break;
        case 'up':
        keyChange=6
        break;
        case 'down':
        keyChange=7
        break;
        case 'r':
        keyChange=8
        break;
        case 'l':
        keyChange=9
        break;
        case 'menu':
        keyChange=10
        break;
        case 'turbo':
        keyChange=11
        break;
        default:
            return
        }
        this.keyChange=keyChange
        document.onkeydown = (e)=>{this.hookKey(e)}
        document.onkeyup = ""
    }
}

/*  H
k=0-10
var this.keyState = {
    //"a": [node][1][2]
    //node usefull only for vk
};
const keyList = ["a", "b", "select", "start", "right", "left", 'up', 'down', 'r', 'l', 'menu', 'turbo'];
const keymap = [88, 90, 16, 13, 39, 37, 38, 40, 87, 81, 27, 84] // z x shift enter right left up down w q, escape, t
this.keycodemap= ["z", "w", "shift","enter", "right","left","up","down", "x", "a", "Escape" "t"]
*/