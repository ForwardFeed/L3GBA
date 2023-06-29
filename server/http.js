import express from 'express'; 
import cookieParser from 'cookie-parser';
import path from 'path'
const __dirname = path.resolve(path.dirname(''));


function sanInput(data){
	return data.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
}

// Validate if the request has its parameters valid for the room access
function roomReqParamChecker(req){
	let room = req.query.room
	let passwd = req.query.passwd
	let name = req.query.name
	if(room==undefined || passwd==undefined || name==undefined){
		//bad request
		//400
		return false
	}
	room = sanInput(room)
	passwd = sanInput(passwd)
	name = sanInput(name)
	if(room.length > 20 || passwd.length >20 || name.length >20
		|| room.length < 1 || name.length < 1){
		//bad request
		//params too big i refuse
		return false
	}
	return [room, passwd, name]
}

function addClient(room, username, roomName){
	let id = room.addAuthClient(username)
	let SeparationChar = '~'
	return roomName+SeparationChar+id
}

export function init(rooms, cfg, pLog){
	
	const http = express()
	const port = cfg.http_port
	const hostname = cfg.hostname
	const cookieMaxAge=1000*60*60*12
	const cookieParam = { httpOnly: false, maxAge: cookieMaxAge, sameSite:true}

	http.use(cookieParser())
	http.use(express.static('client'))
	
	const log = pLog.getLogger('http')
	log.setLevel(cfg.http_loglevel)

	http.post("/join_room", function(req, res) {
		var params = roomReqParamChecker(req)
		if(!params){
			log.warn(`/join_room: bad attempt \
			[${req.query.room}|${req.query.passwd}|${req.query.name}]`)
			res.status(400);
			res.send()
			return
		}
		var roomName = params[0]
		var passwd = params[1]
		var username = params[2]

		var room = rooms.getRoom(roomName)
		if(!room){
			//no room with this name
			//404
			res.status(404);
		}else if(!room.comparePasswd(passwd)){
			//wrong passwd
			//401
			res.status(401);
		}else if(room.hasUsernameActive(username)){
			//an active user in the room has already this username
			//409
			res.status(409);
		}
		else{
			//good room
			//good password
			//unique username
			//200
			let auth_token = addClient(room, username, roomName)
			
			log.info(`/join_room: new auth [${auth_token}]`)
			res.cookie('token', auth_token, cookieParam);
			res.status(200);
		}
		res.send()	
	})

	http.get("/room", function(req, res) {
		res.sendFile(__dirname+"/client/room/room.html")
	})

	http.post("/create_room", function(req, res) {
		/*	
			clean unused room
			however this here has a high DOS potential 
			if no middleware is to protect evil people from
			creating endless rooms until the server dies.
			it could also get trapped by someone tarpiting the ws :x
		*/
		rooms.killInactiveRoom()
		var params = roomReqParamChecker(req)
		if(!params){
			log.warn(`/create_room: bad attempt \
			[${req.query.room}|${req.query.passwd}|${req.query.name}]`)
			res.status(400);
			res.send()
			return
		}
		var roomName = params[0]
		var passwd = params[1]
		var username = params[2]
		if(rooms.roomExist(roomName)){
			//a room already exist with this name
			//409
			res.status(409);
		}
		else{
			//original room name
			//201 a room has been created.
			let room = rooms.createRoom(roomName, passwd)
			log.info(`/create_room: new room [${roomName} ${passwd}]`)

			let auth_token = addClient(room, username, roomName)
			log.debug(`/create_room: new auth [${auth_token}]`)

			res.cookie('token', auth_token, cookieParam);
			res.status(201);
		}
		res.send()	
	})

	http.listen(port, () => {
		log.info(`HTTP server listening on http://${hostname}:${port}`)
	})
}
