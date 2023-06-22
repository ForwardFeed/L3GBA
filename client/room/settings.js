//here will all functions related to the room settings category
/*
    SETTINGS ID for L3GBA API

    1=>pauseonjoin  
    2=>pauseondisconnect

    SETTINGD VALUE for L3GBA API

    checkbox=>0(uncheck) | 1(checked)

*/
var roomSettings=[
    0,0,0
]

function parseSettings(msg){
    switch(msg[0]){
        case "0":

        break;
        case "1":
            var checkbox = document.getElementById("setpauseonjoin")
            if(msg[1]=="1"){
                checkbox.checked=true
            }else{
                checkbox.checked=false
            }
        break;
        case "2":
            var checkbox = document.getElementById("setpauseondisc")
            if(msg[1]=="1"){
                checkbox.checked=true
            }else{
                checkbox.checked=false
            }
        break;
        default:
            console.warn("unknown settings ID: "+msg[2])
    }
}
function parseAllSettings(msg){
    let setsArray = msg.split("~")
    for(let i=0; i<setsArray.length-1;i++){
        parseSettings(setsArray[i])
        roomSettings[i]=setsArray[i][1]
    }
}

function initCheckBoxes(){
    let box = document.getElementById("setpauseonjoin")
    box.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_11")
        }else{
            socket.send("x_10")
        }
    }
    box = document.getElementById("setpauseondisc")
    box.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_21")
        }else{
            socket.send("x_20")
        }
    }
    
}

initCheckBoxes()