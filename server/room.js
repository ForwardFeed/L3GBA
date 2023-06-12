class L3GBAroom{
    constructor(name, passwd){
        this.idList=new Array()//token list
        this.name=name
        this.passwd=passwd

        
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
    /*
        ARG a client auth token
        RETURN a room id which this token belong
    */
    
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
        /*
        for(let i=0;i<this.roomList.length;i++){
            let room = this.roomList[i]
            if(!room.onUse && room.hasExpired){
                this.roomList.splice(i, 1)
            }
        }*/
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
    /*
        name: name of the room
        
        return -1 or the room "id" (one may call it the room iterator)
    */
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
        //!TODO limit the number of chars
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
        let room = this.roomMap.get(ws.room)
        if(!room){
            console.error("no room named", ws.room)
            return
        }
        if(flag){
            room.addActiveClient(ws)
        }else{
            room.removeActiveClient(ws)
        }
    }
    createRoom(name, passwd){
        this.roomMap.set(name, new L3GBAroom(name, passwd))
        //this.roomList.push(new L3GBAroom(name, passwd))
        //return this.roomList.length-1
    }

    getRoom(name){
        return this.roomMap.get(name)
    }
}