import { WebSocketServer } from 'ws';


function parseToken (data){
	let roomRE=/^[^~]+/
	let roomID=roomRE.exec(data)[0]||""
	let tokenRE=/[^~]+$/
	let token=tokenRE.exec(data)[0]||""
	return [roomID, token]
}

function areAllReady(room){
	room.aClients.forEach(function(client){
		if(!client.ready){
			return false
		}
	})
	return true
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
		sender.room.aClients.forEach(function(client){
			if(client == sender){
				return
			}
			client.send(data)
		})
		return
	}

	wss.on('connection', function connection(ws) {
		log.debug("client connection")

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
			
			if(rooms.checkAuthedClient(parsed[0], parsed[1])){
				// we no longer need to parse the auth now
				// start parsing this project API
				ws.on('message', L3GBAAPIParsing)
				ws.auth=true
				ws.ready=0
				ws.room = rooms.getRoom(parsed[0])
				ws.id = parsed[1]
				log.info(`client [${ws.id}] auth valid in [${ws.room.name}]`)
				ws.send("valid")
				rooms.setActivityClient(ws, true)
			}else{
				ws.send("invalid")
				ws.close()
				return 
			}
			
			
		}
		
		ws.on('error', log.error);
		ws.once('message', clientAuth)
		
		ws.on('close', function close() {
			if(!ws.auth){
				log.info("client disconnected: reason: bad auth")
				return
				//bad auth
			}
			rooms.setActivityClient(ws, false)
			let bcMsg = "q_"+ws.username
			wss.broadcast(bcMsg, ws)
			log.info(`client disconnected [${ws.id}]`)

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
				case "n":
					ws.username=msg.substring(2).substring(0,20)
					if(ws.username==undefined){
						ws.username=="anonymUWUs"
					}
					
					var number = 0
					var connectedUsers=""
					ws.room.aClients.forEach(function(client){
						if(client==ws){
							
						}
						else if(client.username==ws.username){
							number++
							ws.username=msg.substring(2)+number
							connectedUsers+=client.username+client.ready+"~"
						}else{
							connectedUsers+=client.username+client.ready+"~"
						}
					})
					//then we append
					connectedUsers+=ws.username+"0"
					//so first tell the client about his username
					ws.send("n_"+ws.username)
					//tell others a new fren has joined and which is not ready
					wss.broadcast("j_"+ws.username, ws)
					//answer back to the client with the list of active clients
					ws.send("l_"+connectedUsers)
					break;
				case "r":
					ws.ready=msg.substring(2)
					wss.broadcast("r_"+ws.username+msg.substring(2),ws)
					break;
				case "s":
					if(areAllReady(ws.room)){
						ws.send("s")
						wss.broadcast("s", ws)
					}
					break;
				case "x":
					ws.room.updateRoomSettings(msg[2], msg[3])
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
					if(areAllReady(ws.room)){
						ws.send(msg)
						wss.broadcast(msg, ws)
					}
					break;
				default:
					log.warn("L3GBAPI : unknown client message %s", data)
			}
		}
		
		
	});

	log.info(`Websocket server listening on ws://${cfg.hostname}:${cfg.ws_port}`)
}

