import express from 'express'; 
import cookieParser from 'cookie-parser';
import path from 'path'
const __dirname = path.resolve(path.dirname(''));




export function init(rooms, cfg, pLog){
	
	const http = express()
	const port = cfg.http_port
	const hostname = cfg.hostname
	const cookieMaxAge=1000*60*60*12

	http.use(cookieParser())
	http.use(express.static('client'))
	
	const log = pLog.getLogger('http')
	log.setLevel(cfg.http_loglevel)

	http.post("/join_room", function(req, res) {
		
		let name = req.query.name
		let passwd = req.query.passwd
		if(name==undefined || passwd==undefined){
			//bad request
			//400
			log.warn("/join_room: attempt with no name or passwd field")
			res.status(400);
			res.send()
			return
		}
		name = name.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		passwd = passwd.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		if(name.length > 20 || passwd.length >20){
			//too big i refuse
			log.warn(`/join_room: bad attempt [${name} ${passwd}]`)
			res.status(400);
		}
		else if(! rooms.roomExist(name)){
			//no room with this name
			//404
			res.status(404);
		}
		else if(!rooms.checkPasswd(name, passwd)){
			//wrong passwd
			//401
			res.status(401);

		}else{
			//good room
			//good password
			//200
			let auth_token = rooms.addAuthedClient(name)
			log.info(`/join_room: new auth [${auth_token}]`)
			res.cookie('token', auth_token, { maxAge: cookieMaxAge, sameSite: true});
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

		let name = req.query.name.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		let passwd = req.query.passwd.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"");

		if(!name || passwd==undefined ){
			//bad request
			//400
			log.warn("/create_room: attempt with no name or passwd field")
			res.status(400);
			res.send()
			return
		}
		name = name.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		passwd = passwd.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		if(name.length > 20 || passwd.length >20){
			//too big i refuse
			log.warn(`/create_room: bad attempt [${name} ${passwd}]`)
			res.status(400);
		}
		else if(rooms.roomExist(name)){
			//a room already exist with this name
			//409
			res.status(409);
		}
		else{
			//original room name
			//201 a room has been created.
			rooms.createRoom(name, passwd)
			log.info(`/create_room: new room [${name} ${passwd}]`)
			let auth_token = rooms.addAuthedClient(name)
			log.debug(`/create_room: new auth [${auth_token}]`)
			res.cookie('token', auth_token, { maxAge: cookieMaxAge, sameSite:true});
			res.status(201);
		}
		
		res.send()	
	})

	http.listen(port, () => {
		log.info(`HTTP server listening on http://${hostname}:${port}`)
	})
}
