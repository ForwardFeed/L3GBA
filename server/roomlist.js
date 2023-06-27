import {L3GBAroom} from "./room.js"

export class L3GBARoomList{
    constructor(cfg, pLog){
        this.log = pLog.getLogger('rooms')
	    this.log.setLevel(cfg.ws_loglevel)
        this.roomMap= new Map()
    }
    /*
        function to clean unused rooms
    */
    killInactiveRoom(){
        for (const [key, val] of this.roomMap){
            if(!val.onUse && val.hasExpired){
                this.log.info(`deleting room [${val.name}]`)
                this.roomMap.delete(key)
            }
        }
    }
    /*
        return a string reasonnably long of a type:
        ROOMNAME-XXXXXXXX where X is a hexadecimal symbol

        if one day there is two different client with the same token at the same time
        i'm gonna give a kidney to charity
    */
    getLikelyUniqueToken(){
        function s4(){
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4()+s4()
    }

    roomExist(name){
        return this.roomMap.has(name)
    }

    checkPasswd(name, passwd){
        if(!name){
            this.log.debug("checkPasswd: missing param: name")
            return false
        }
        return this.roomMap.get(name).comparePasswd(passwd)
    }

    addAuthedClient(name){
        let room = this.roomMap.get(name)
        let token = this.getLikelyUniqueToken()
        
        room.addToken(token)
        let SeparationChar = '~'
        let clientToken = name+SeparationChar+token
        this.log.debug("added token ["+clientToken+"]")
        return clientToken
    }

    checkAuthedClient(name, token){      
        if(!name){
            this.log.warn("checkAuthedClient: missing param: name")
            return false
        }if(!token){
            this.log.warn("checkAuthedClient: missing param: token")
            return false
        }
        let room = this.roomMap.get(name)
        if(!room){
            this.log.debug("checkAuthedClient: no room named:"+ name)
            return false
        }

        return room.hasToken(token)
    }
    /*
        @ws : websocket
        @flag : bool : false remove, true add : default false
    */
    setActivityClient(ws, flag){
        if(!ws){
            this.log.warn("setActivityClient: missing param: ws")
            return
        }
        if(!ws.room){
            this.log.warn("setActivityClient: ws missing room prop")
            return
        }
        if(flag){
            this.log.debug(`setActivityClient adding active client [${ws.id}] in [${ws.room.name}]`)
            ws.room.addActiveClient(ws)
        }else{
            this.log.debug(`setActivityClient removing active client [${ws.id}] in [${ws.room.name}]`)
            ws.room.removeActiveClient(ws)
        }
    }
    createRoom(name, passwd){
        this.log.debug("createRoom creating new room: "+name)
        this.roomMap.set(name, new L3GBAroom(name, passwd))
    }

    getRoom(name){
        return this.roomMap.get(name)
    }
}