import * as config from './server/config.js';
import * as webSocketServer from './server/ws.js'
import * as httpServer from './server/http.js'
import { L3GBARoomList } from './server/roomlist.js';

let log = config.configureLogger()
let cfg = config.retrieve("./config/personal.json")
if (!config.verify(cfg, log, true)){
    log.getLogger('critical').info("configuration file invalid, exiting")
    process.exit(1)
}
log.setLevel(cfg.loglevel)
log.info("configuration file valid")
var rooms = new L3GBARoomList(log)
httpServer.init(rooms, cfg, log)
webSocketServer.init(rooms, cfg, log)
