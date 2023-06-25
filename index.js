import * as config from './config.js';
import * as webSocketServer from './server/ws.js'
import * as httpServer from './server/http.js'
import { L3GBARoomList } from './server/room.js';

let cfg = config.retrieve("./config/personal.json")
var rooms = new L3GBARoomList()
httpServer.init(rooms, cfg)
webSocketServer.init(rooms, cfg)