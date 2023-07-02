import * as config from './server/config.js';
import * as webSocketServer from './server/ws.js'
import * as httpServer from './server/http.js'
import { L3GBARoomList } from './server/roomlist.js';

const log = config.configureLogger()
const cfgFile = "./config/personal.json"

var cfg

try{
    cfg = config.retrieve(cfgFile)
}catch(e){
    log.getLogger('critical').info(`couldn't retrieve ${cfgFile} exiting`)
    process.exit(1)
}

if (!config.verify(cfg, log, true)){
    log.getLogger('critical').info("configuration file invalid, exiting")
    process.exit(2)
}
log.setLevel("info")
log.info("configuration file valid")
var rooms = new L3GBARoomList(cfg, log)
httpServer.init(rooms, cfg, log)
webSocketServer.init(rooms, cfg, log)
