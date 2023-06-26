export class L3GBAroom{
    constructor(name, passwd){
        this.idList=new Array()//token list
        this.name=name
        this.passwd=passwd
        this.roomSettings=[
            0,0,0,0,2  //for more infos check the client side settings.js file
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

