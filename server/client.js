//mainly to keep track of authed client
export class L3GBAClient{
    constructor(username){
        this.username = username
        this.ws = null
    }
}