import {L3GBAClient} from './client.js'
export class L3GBAroom{
    constructor(name, passwd){
        this.idList=new Array()//token list
        this.name=name
        this.passwd=passwd
        this.roomSettings=[
            0,0,0,0,2  //for more infos check the client side settings.js file
        ]

        this.lastActive=Date.now()
        this.emptyTTL=6*1000*10//empty time to live in millis
        this.onUse=false

        // array [token, username, websocket ,activity status]
        // array [string, string, object ,bool]
        this.clients=new Map()
        this.aClientsCnt = 0; //active client count
        this.clientNumber = 0;
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

    getUniqueID(){
        function s4(){
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16).substring(1);
        }

        while (true){
            let id = s4()+s4()
            if(!this.clients.has(id)){
                return id
            }
        }
    }

    addAuthClient(username){
        this.clearAuthForUsername(username)
        let id = this.getUniqueID()
        this.clients.set(id, new L3GBAClient(username))
        return id
    }

    addActiveClient(ws){
        let client = this.clients.get(ws.id)
        if(!client){
            return false
        }
        this.onUse=true
        this.aClientsCnt++
        
        client.ws=ws
        client.ws.number = this.clientNumber++;
        return true
    }

    removeClient(id){
        let hasWorked = this.clients.delete(id)
        if(hasWorked){
            this.aClientsCnt--
            if(this.aClientsCnt<=0){
                this.lastActive=Date.now()
                this.onUse=false
            }
            return true
        }
        return false
    }

    removeActiveClient(id){
        this.clients.get(id).ws=null
        this.aClientsCnt--
        if(this.aClientsCnt<=0){
            this.lastActive=Date.now()
            this.onUse=false
        }
    }
    
    hasID(id){
        return this.clients.has(id)
    }

    clearAuthForUsername(username){
        this.clients.forEach(function(value, key, map){
            if(value.username==username){
                map.delete(key)
            }
        });
    }
    hasUsernameActive(username){
        var flag = false;
        this.clients.forEach(function(value, key, map){
            if(value.username==username && value.ws){
                flag=true
            }
        });
        return flag
    }

    areAllReady(){
        var flag = true;
        this.clients.forEach(function(value, key, map){
            if(value.ws == null){
                return
            }
            if(value.ws.ready==false){
                flag=false
            }
        });
        return flag
    }
    
    getUsername(id){
        return this.clients.get(id).username
    }

    
    getUserList(){
        var userList = "";
        this.clients.forEach(function(val, key, map){
            if(val.ws==null){
                return
            }
            let r = val.ws.ready ? 1 : 0
            userList+=val.username+"#"+val.ws.number+r+"~"
        });
        return userList
    }

    isAlreadyActive(id){
        if(this.clients.get(id).ws){
            return true
        }
        return false
    }

    getRoomSettings(){
        return this.roomSettings
    }

    updateRoomSettings(index, value){
        this.roomSettings[index]=value
    }

    fromRecover(data){
        for(let i=0;i<data.length;i++){
            let id = data[i][0]
            let username = data[i][1]
            let client = new L3GBAClient(username)
            this.clients.set(id, client)
        }
    }
}

