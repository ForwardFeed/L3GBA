

import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ port: 9091 });


function parseToken (data){
	let roomRE=/^[^~]+/
	let roomID=roomRE.exec(data)[0]||""
	let tokenRE=/[^~]+$/
	let token=tokenRE.exec(data)[0]||""
	return [roomID, token]
}


export function init(rooms){
	wss.broadcast = function(data, sender) {
		if(!sender){
			console.warn("no sender given in broadcast function")
			return
		}
		rooms.getRoom(sender.room).aClients.forEach(function(client){
			if(client == sender){
				return
			}
			client.send(data)
		})
		return
	}

	wss.on('connection', function connection(ws) {
		console.log("client connected")

		let clientAuth = (data)=>{
			let msg = data.toString()
			// the minimun length of a token is 10
			if(!msg || msg.length<10){
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
				ws.room = parsed[0]
				ws.id = parsed[1]
				ws.send("valid")
				rooms.setActivityClient(ws, true)
			}else{
				ws.send("invalid")
				ws.close()
				return 
			}
			
			
		}
		
		ws.on('error', console.error);
		ws.once('message', clientAuth)
		
		ws.on('close', function close() {
			if(!ws.auth){
				return
				//bad auth
			}
			rooms.setActivityClient(ws, false)
			let bcMsg = "q_"+ws.username
			wss.broadcast(bcMsg, ws)
	  		console.log("client disconnected")
		});

		let L3GBAAPIParsing = (data)=>{
			let msg = data.toString()
			switch(msg[0]){
				case "d":
					wss.broadcast(msg, ws)
				case "u":
					wss.broadcast(msg, ws)
				case "o":
					wss.broadcast(msg, ws)
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
					rooms.getRoom(ws.room).aClients.forEach(function(client){
						if(client==ws){
							connectedUsers+=client.username+client.ready+"~"
							return
						}
						if(client.username==ws.username){
							number++
							ws.username=msg.substring(2)+number
							connectedUsers+=client.username+client.ready+"~"
						}
					})
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
					var isOneNotReady=false
					rooms.getRoom(ws.room).aClients.forEach(function(client){
						if(!client.ready){
							isOneNotReady=true
						}
					})
					if(!isOneNotReady){
						ws.send("s")
						wss.broadcast("s", ws)
					}
					break;
				default:
					console.warn("API wise unknown client message %s", data)
			}
		}
		
		
	});

	console.log("WebSocket Server has been initialised")
}

