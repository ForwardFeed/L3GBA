//here will all functions related to the room settings category
/*
    SETTINGS ID for L3GBA API

    1=>pauseonjoin  
    2=>pauseondisconnect
    3=>disableturbo
    4=>turbospeed (default 2)
    SETTINGD VALUE for L3GBA API

    checkbox=>0(uncheck) | 1(checked)

*/
var roomSettings=[
    0,0,0,0,2
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
        case "3":
            var checkbox = document.getElementById("setturbomode")
            if(msg[1]=="1"){
                checkbox.checked=true
            }else{
                checkbox.checked=false
            }
        break;
        case "4":
            var number = document.getElementById("seturbospeed")
            number.value=msg.substring(1)
        break;
        default:
            console.warn("unknown settings ID: "+msg[0])
            return
    }
    roomSettings[msg[0]]=msg[1]
}
function parseAllSettings(msg){
    let setsArray = msg.split("~")
    for(let i=0; i<setsArray.length-1;i++){
        parseSettings(setsArray[i])
        roomSettings[i]=setsArray[i][1]
    }
}

function initCheckBoxes(){
    let setting = document.getElementById("setpauseonjoin")
    setting.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_11")
        }else{
            socket.send("x_10")
        }
    }
    setting = document.getElementById("setpauseondisc")
    setting.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_21")
        }else{
            socket.send("x_20")
        }
    }
    setting = document.getElementById("setturbomode")
    setting.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_31")
        }else{
            socket.send("x_30")
        }
    }
    setting = document.getElementById("seturbospeed")
    setting.onchange=(ev)=>{
        socket.send("x_4"+setting.value)
        roomSettings[4]=setting.value
    }
}

initCheckBoxes()