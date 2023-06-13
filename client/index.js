function sanInput(input){
    if(!input){
        return ""
    }
    return input.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/gim,"").substring(0,20)
}
var errorFeedBack = document.getElementById("err-room")
{ //setup for room join
    let joinRoomOnclick=(ev)=>{
        let roomName=sanInput(ev.target.parentNode.children[1].value)
        let username=sanInput(document.getElementById('username').value)
        if(!roomName){
            errorFeedBack.innerText="you forgot about room name didn't you"
            return
        }else if(!username){
            errorFeedBack.innerText="c'mon take a username, won't do that for you"
            return
        }
        let passwd=ev.target.parentNode.children[3].value
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 ){
                if(this.status == 200){
                    localStorage.setItem('username', username)
                    window.location.href='/room'
                }else if(this.status == 404){
                    errorFeedBack.innerText="No room like this one"
                }else if(this.status == 401){
                    errorFeedBack.innerText="Bad password"
                }else if(this.status == 400){
                    errorFeedBack.innerText="Client and server seems to not agree on something O_O'"
                }
          }
        };
        let requestURL = "/join_room?name="+roomName+"&passwd="+passwd
        xhttp.open("POST", requestURL, true);
        xhttp.send();
    }
    let roomJoin= document.getElementById("join-room")
    roomJoin.onclick=joinRoomOnclick
}

{ //setup for room creation
    let createRoomOnclick=(ev)=>{
        let roomName=sanInput(ev.target.parentNode.children[1].value)
        let username=sanInput(document.getElementById('username').value)
        if(!roomName){
            errorFeedBack.innerText="you forgot about room name didn't you"
            return
        }else if(!username){
            errorFeedBack.innerText="c'mon take a username, won't do that for you"
            return
        }
        let passwd=ev.target.parentNode.children[3].value
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 ){
                if(this.status == 201){
                    localStorage.setItem('username', username)
                    window.location.href='/room'
                }else if(this.status == 409){
                    errorFeedBack.innerText="a room with this name already exist"
                }else if(this.status == 400){
                    errorFeedBack.innerText="Client and server seems to not agree on something O_O'"
                }
          }
        };
        let requestURL = "/create_room?name="+roomName+"&passwd="+passwd
        xhttp.open("POST", requestURL, true);
        xhttp.send();
    }
    let roomCreate= document.getElementById("create-room")
    roomCreate.onclick=createRoomOnclick
}

{   // pre-input sanitazation
    let onInputSan = function(input){
        input.target.value=sanInput(input.target.value)
    }
    let node = document.getElementById("create-room-name")
    node.onchange=onInputSan
    node.onpaste    = onInputSan
    node.oninput    = onInputSan
    node = document.getElementById("join-room-name")
    node.onchange=onInputSan
    node.onpaste    = onInputSan
    node.oninput    = onInputSan
    node = document.getElementById("username")
    node.onchange=onInputSan
    node.onpaste    = onInputSan
    node.oninput    = onInputSan
}

{ // hardware / software checking
    
}


document.getElementById('username').value=localStorage.getItem('username')