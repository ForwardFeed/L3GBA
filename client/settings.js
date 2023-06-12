

var KEY_NUM_TO_CHANGE = -1
var hookKey = (e)=>{
	keymap[KEY_NUM_TO_CHANGE]=e.keyCode
	showMsg("key choosed: "+e.key)
	saveKeys()
	document.onkeydown = normalKeyDown
	document.onkeyup = normalKeyUp
}

function SetBtn(btn){
	showMsg("click on a button on your keyboard to set it", 4000)
	switch(btn){
	case 'a': 
	KEY_NUM_TO_CHANGE=0
	break;
	case 'b':
	KEY_NUM_TO_CHANGE=1
	break;
	case 'select':
	KEY_NUM_TO_CHANGE=2
	break;
	case 'start':
	KEY_NUM_TO_CHANGE=3
	break;
	case 'right':
	KEY_NUM_TO_CHANGE=4
	break;
	case 'left':
	KEY_NUM_TO_CHANGE=5
	break;
	case 'up':
	KEY_NUM_TO_CHANGE=6
	break;
	case 'down':
	KEY_NUM_TO_CHANGE=7
	break;
	case 'r':
	KEY_NUM_TO_CHANGE=8
	break;
	case 'l':
	KEY_NUM_TO_CHANGE=9
	break;
	default:
		return
	}
	document.onkeydown = hookKey
	document.onkeyup = ""
}

function saveKeys(){
	localStorage.setItem('gba-keybinds', keymap)
}

function loadSaveKeys(){
	let keybinds = localStorage.getItem('gba-keybinds', keymap)
	if(!keybinds){
		return
	}
	//geeee i wish there was a cleaner way to do that
	keybinds = keybinds.split(',')
	for(let i=0; i<keybinds.length;i++){
		keymap[i]=Number(keybinds[i])
	}
}


loadSaveKeys()

