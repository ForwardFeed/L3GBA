import * as http from 'http'
import * as fs from 'fs';;

const hostname = '192.168.1.140';
const port = 9090;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
 	res.setHeader('Content-Type','text/html');
	if( req.url == '/'){
		let html = fs.readFileSync('./index.html')
		res.end(html);
		return
	}
	try{
		let ress = fs.readFileSync('.'+req.url)
		let mimetype = req.url.split('.').pop()
		if(mimetype=='js'){
			res.setHeader('Content-Type','text/javascript');
		}else if(mimetype=='wasm'){
			res.setHeader('Content-Type','application/wasm');
		}else if(mimetype=='png'){
			res.setHeader('Content-Type','image/png');
		}else if(mimetype=='svg'){
			res.setHeader('Content-Type','image/svg+xml');
		}
		res.end(ress);
	}
	catch(e){
		res.setHeader('Content-Type','text/html');
		res.statusCode = 404;
		res.end("Error 404")
	}
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


var clientsReady = []

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 9091 });


wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.broadcast = function(data, sender) {
	wss.clients.forEach(function(client) {
		if (client !== sender) {
	  		client.send(JSON.stringify(data))
		}
  	})
}

wss.on('connection', function connection(ws) {
	ws.id = wss.getUniqueID();
	ws.on('error', console.error);
	
	ws.on('message', function message(data) {
		console.log("%s",data)
		if(data=="sync"){
			clientsReady.push(ws.id)
			if(clientsReady.length<=1){
				ws.send('ok_wait')
			}
			else{
				ws.send('ok_go')
				wss.broadcast('ok_go', ws);
			}
		}else if(data=="pause_on"){
			wss.broadcast('pause_on', ws);
		}else if(data=="pause_off"){
			wss.broadcast('pause_off', ws);
		}
		else{
			wss.broadcast(data, ws);
		}
	});
	
	ws.on('close', function close() {
  		for(let i=0;i<clientsReady.length;i++){
  			if( clientsReady[i] == ws.id){
  				clientsReady.splice(i, 1)
  			}
  		}
  		console.log("ok")
	});

  
});

