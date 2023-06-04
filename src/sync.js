let wsAdd = "ws://"+document.domain+":9091"
const socket = new WebSocket(wsAdd);


function parseSyncMsg(msg){
	let waitSync=document.getElementById('sync-wait')
	
	if(msg=="ok_go" || msg=='"ok_go"'){
		waitSync.hidden=true
		socket.removeEventListener("message", onWait)
		socket.addEventListener("message", parseInputMsg);
	 	startEmulation()
	}else if(msg=="ok_wait"){
		//i'll show a wait for the other player one day
		return
	}
	else{
		console.error("SYNC error: server said "+ msg)
		alert("SYNC ERROR")
		waitSync.hidden=true
	}
}

function parseInputMsg(e){
	try{
		let msg = JSON.parse( e.data );
		console.log(msg)
		if (!msg.data){
			switch(msg){
				case "pause_on":
					setPauseMenu(true)
					isSyncPause = true
				break;
				case "pause_off":
					setPauseMenu(false)
					isSyncPause = true
				break;
				default:
					console.warn("unusual server message: "+ msg)
				
			}
			return
		}
		let keytype=String.fromCharCode(msg.data[0])
		let keycode=String.fromCharCode(msg.data[1])
		switch(keytype){
			case "u":
				keyState[keyList[keycode]][1] = 0
			break;
			case "d":
				keyState[keyList[keycode]][1] = 1
			break;
			default:
				console.warn("odd keytype" + keytype)
				return
		}
	}catch(err){
		console.error(err)
	}
}

{
	let onCCB=()=>{
		let waitSync=document.getElementById('sync-wait')
    	waitSync.hidden=false
    	socket.send("sync");
    	onWait=(e)=>{
    		parseSyncMsg(e.data)
    	}
		socket.addEventListener("message", onWait);
	}
	let btnSync = document.getElementById('btn-sync')
    btnSync.onclick=onCCB
    
}






