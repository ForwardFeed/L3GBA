import { WebSocketServer } from 'ws';

function parseToken (data){
	let roomRE=/^[^~]+/
	let roomID=roomRE.exec(data)[0]||""
	let tokenRE=/[^~]+$/
	let token=tokenRE.exec(data)[0]||""
	return [roomID, token]
}

export function init(rooms, cfg, pLog){
	const log = pLog.getLogger('ws')
	log.setLevel(cfg.ws_loglevel)

	const wss = new WebSocketServer({ port: cfg.ws_port });
	wss.broadcast = function(data, sender) {
		if(!sender){
			log.warn("no sender given in broadcast function")
			return
		}
		sender.room.clients.forEach(function(value, key, map){
			if(sender == value.ws || value.ws == null){
				return
			}
			value.ws.send(data)
		});
		return
	}
	const interval = setInterval(()=>{
		rooms.pingRoutine()
	}, 8000);
	  
	wss.on('close', function close() {
		clearInterval(interval);
	});

	wss.on('connection', function connection(ws) {
		log.debug("client connection")

		let heartBeat = () =>{
			ws.isAlive=true
			ws.latency = Date.now() - ws.beforePing
		}

		let clientAuth = (data)=>{
			let msg = data.toString()
			// the minimun length of a token is 10
			if(!msg || msg.length<10 || msg.length>29){
				if(msg){
					log.warn(`client tried connection with this invalid auth: [${msg}]`)
				}
				ws.send("invalid")
				/* a good willed clients wouldn't spam
				 and would end up reloading the page
				*/
				ws.close()
				return
			}
			let parsed = parseToken(msg)
			var roomName = parsed[0]
			var clientID = parsed[1] 
			var room = rooms.getRoom(roomName)
			if(!room || !room.hasID(clientID)){
				ws.send("invalid")
				ws.close()
				return
			}else if(room.isAlreadyActive(clientID)){
				ws.send("in use")
				ws.close()
				return
			}
			// the auth is valid
			ws.room=room
			ws.id=clientID
			ws.username=room.getUsername(clientID)
			ws.auth=true
			ws.ready=false
			
			ws.on('message', L3GBAAPIParsing)
			log.info(`client [${clientID}] auth valid in [${roomName}]`)
			//informs the client its auth is valid
			ws.send("valid")
		}
		
		ws.on('error', log.error);
		ws.once('message', clientAuth)
		
		ws.on('close', function close() {
			if(!ws.auth){
				log.info("client disconnected: reason: bad auth")
				return
				//bad auth
			}
			ws.room.removeActiveClient(ws.id)
			let status = ws.ready?1:0
			let bcMsg = "q_"+ws.username+"#"+ws.number+status
			wss.broadcast(bcMsg, ws)
			if(ws.timedOut){
				log.info(`client ${ws.id} timed out`)
			}else{
				log.info(`client disconnected [${ws.id}]`)
			}
			

		});
		let L3GBAAPIParsing = (data)=>{
			let msg = data.toString()
			switch(msg[0]){
				case "d":
					wss.broadcast(msg, ws)
					break;
				case "u":
					wss.broadcast(msg, ws)
					break;
				case "o":
					wss.broadcast(msg, ws)
					break;
				case "f":
					wss.broadcast(msg, ws)
					break;
				case "r":
					ws.ready=msg.substring(2)
					wss.broadcast("r_"+ws.username+msg.substring(2),ws)
					break;
				case "s":
					if(ws.room.areAllReady()){
						ws.send("s")
						wss.broadcast("s", ws)
					}
					break;
				case "x":
					ws.room.updateRoomSettings(msg[2], msg.substring(1))
					wss.broadcast(msg, ws)
					break;
				case "a":
					var settings = ws.room.getRoomSettings()
					var retMsg = "a_"
					for(let i=0;i<settings.length;i++){
						retMsg+=""+i+settings[i]+"~"
					}
					ws.send(retMsg)
					break;
				case "z":
					if(ws.room.areAllReady()){
						ws.send(msg)
						wss.broadcast(msg, ws)
					}
					break;
				case "g":
					// prevent a malicious user from abusing
					if(ws.number){
						return
					}
					//add to the room and assignate a client number
					ws.room.addActiveClient(ws)
					//informs roommates about a new joined player
					wss.broadcast("j_"+ws.username+"#"+ws.number+"0", ws)
					//informs the new joined player about roomates
					ws.send("l_"+ws.room.getUserList())
					//begin the check for aliveness
					ws.isAlive=true
					ws.beforePing=Date.now()
					ws.on('pong', heartBeat)
					break;
				default:
					log.warn("L3GBAPI : unknown client message %s", data)
			}
		}
		
		
	});

	log.info(`Websocket server listening on ws://${cfg.hostname}:${cfg.ws_port}`)
}

