import express from 'express'; 
import cookieParser from 'cookie-parser';
import path from 'path'
const __dirname = path.resolve(path.dirname(''));




export function init(rooms){
	const http = express()
	const port = 9090
	const hostname = '127.0.0.1';

	http.use(cookieParser())
	http.use(express.static('client'))
	
	http.post("/join_room", function(req, res) {
		//!TODO SANITIZE
		let name = req.query.name.replace(/[^a-zA-Z0-9.-]/g);
		let passwd = req.query.passwd.replace(/[^a-zA-Z0-9.-]/g);
		if(name==undefined || passwd==undefined){
			//bad request
			//400
			res.status(400);
		}
		if(! rooms.roomExist(name)){
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
			// the user has less than 2 minutes to connect itself
			res.cookie('token', auth_token, { maxAge: 120000, sameSite: true});
			res.status(200);
		}
		res.send()	
	})

	http.get("/room", function(req, res) {
		res.sendFile(__dirname+"/client/room.html")
	})

	http.post("/create_room", function(req, res) {
		/*	
			clean unused room
			however this here has a high DOS potential 
			if no middleware is to protect evil people from
			creating endless rooms until the server dies.
			i could aslo get trapped by someone tarpiting the ws :x
		*/
		rooms.killInactiveRoom()

		let name = req.query.name.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"")
		let passwd = req.query.passwd.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"");

		if(!name || passwd==undefined ){
			//bad request
			//400
			res.status(400);
			res.send()
			return
		}
		if(rooms.roomExist(name)){
			//a room already exist with this name
			//409
			res.status(409);
		}
		else{
			//original room name
			//don't care about password being set or not
			//201 a room has been created.
			rooms.createRoom(name, passwd)
			let auth_token = rooms.addAuthedClient(name)
			// the user has less than 2 minutes to connect itself
			res.cookie('token', auth_token, { maxAge: 120000, sameSite:true});
			res.status(201);
		}
		
		res.send()	
	})

	http.listen(port, () => {
		console.log(`Server http listening on port http://${hostname}:${port}`)
	})
}
