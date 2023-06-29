import {L3GBAroom} from "./room.js"
import fs from 'fs'

export class L3GBARoomList{
    constructor(cfg, pLog){
        this.log = pLog.getLogger('rooms')
	    this.log.setLevel(cfg.ws_loglevel)
        this.roomMap= new Map()
        this.saveFile=cfg.savefile
        this.saveInterval = 60*1000
        fs.readFile(this.saveFile,'utf8', (e,h)=>{this.retrieveFromSave(e,h)})
        this.interval = setTimeout(()=>{this.saveToFile()}, this.saveInterval)

    }
    /*
        function to clean unused rooms
    */
    killInactiveRoom(){
        for (const [key, val] of this.roomMap){
            if(!val.onUse && val.hasExpired()){
                this.log.info(`deleting room [${val.name}]`)
                this.roomMap.delete(key)
            }
        }
    }

    roomExist(roomName){
        return this.roomMap.has(roomName)
    }

    createRoom(name, passwd){
        this.log.debug("createRoom creating new room: "+name)
        this.roomMap.set(name, new L3GBAroom(name, passwd))
        return this.roomMap.get(name)
    }

    getRoom(name){
        return this.roomMap.get(name)
    }

    toRecoverable(entries){
        var roomArray = []
        for (const [key, value] of entries) {
            var clientArray = []
            for (const [k, v] of value.clients.entries()){
                clientArray.push([k, v.username])
            }
            roomArray.push([key, value.passwd, clientArray])
        }
        return roomArray
        
    }
    fromRecover(data){
        for(let i=0;i<data.length;i++){
            let roomName = data[i][1][0]
            let passwd = data[i][1][1]
            let room = new L3GBAroom(roomName, passwd)
            room.fromRecover(data[i][1][2])
            this.roomMap.set(roomName,room)
        }
    }

    retrieveFromSave(err, data){
        if(err){
            this.log.warn(`couldn't retrieve save from ${this.saveFile}`)
            return
        }
        this.fromRecover(JSON.parse(data))
        this.log.info("recovered from save")
    }
    
    saveToFile(){
        let recoverableData = this.toRecoverable(this.roomMap)
        fs.writeFile(this.saveFile,JSON.stringify([...recoverableData.entries()]),'utf8', (err)=>{
            if(err){
                this.log.err(`couldn't save to ${this.saveFile}`)
            }
            this.log.info("saved roomMap")
        })
        this.interval = setTimeout(()=>{this.saveToFile()}, this.saveInterval)
    }   

    forceSaveToFile(){
        clearTimeout(this.interval)
        this.saveToFile()
        this.interval = setTimeout(()=>{this.saveToFile()}, this.saveInterval)
    }
}