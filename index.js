import * as webSocketServer from './server/ws.js'
import * as httpServer from './server/http.js'
import { L3GBARoomList } from './server/room.js';

var rooms = new L3GBARoomList()
httpServer.init(rooms)
webSocketServer.init(rooms)