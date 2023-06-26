import {L3GBAroom} from "./room.js"

export class L3GBARoomList{
    constructor(log){
        this.log=log
        this.roomMap= new Map()
        //this.roomMap.set("id", new L3GBAroom("id", "passwd"))
    }
    /*
        function to clean unused rooms
    */
    killInactiveRoom(){
        this.roomMap.forEach(function(val, key, map){
            if(!val.onUse && val.hasExpired){
                map.delete(key)
            }
        })
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
            return false
        }
        return this.roomMap.get(name).comparePasswd(passwd)
    }

    addAuthedClient(name){
        let token = this.getLikelyUniqueToken()
        this.roomMap.get(name).addToken(token)

        let SeparationChar = '~'
        return  name+SeparationChar+token
    }

    checkAuthedClient(name, token){      
        if(!name || !token){
            return false
        }
        let room = this.roomMap.get(name)
        if(!room){
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
            return
        }
        if(!ws.room){
            this.log.error("no room for client", ws)
            return
        }
        if(flag){
            ws.room.addActiveClient(ws)
        }else{
            ws.room.removeActiveClient(ws)
        }
    }
    createRoom(name, passwd){
        this.roomMap.set(name, new L3GBAroom(name, passwd))
    }

    getRoom(name){
        return this.roomMap.get(name)
    }
}