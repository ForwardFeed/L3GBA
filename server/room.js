class L3GBAroom{
    constructor(name, passwd){
        this.idList=new Array()//token list
        this.name=name
        this.passwd=passwd
        this.roomSettings=[
            0,0,0,  //for more infos check the client side settings.js file
        ]

        this.lastActive=Date.now()
        this.emptyTTL=60000//empty time to live in millis
        this.aClients=new Array()//active-clients
        this.onUse=false
    }

    hasExpired(){
        if(Date.now()-this.lastActive > this.emptyTTL){
            return true
        }
        return false
    }

    comparePasswd(passwd){
        if(this.passwd==passwd){
            return true   
        }
        return false
    }

    addToken(token){
        this.idList[this.idList.length]=token
    }

    addActiveClient(ws){
        this.aClients.push(ws)
        this.idList.filter(token => ws.id != ws.token);
        this.onUse=true
    }

    removeActiveClient(id){
        this.aClients=this.aClients.filter(client => client!=id)
        if(this.aClients.length<=0){
            this.lastActive=Date.now()
            this.onUse=false
        }
        
    }

    hasToken(token){
        for(let i=0; i<this.idList.length;i++){
            if(this.idList[i]==token){
                return true
            }
        }
        return false
    }

    getRoomSettings(){
        return this.roomSettings
    }

    updateRoomSettings(index, value){
        this.roomSettings[index]=value
    }

}

export class L3GBARoomList{
    constructor(){
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
            console.error("no room for client", ws)
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