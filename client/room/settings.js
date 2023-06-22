//here will all functions related to the room settings category
/*
    SETTINGS ID for L3GBA API

    1=>pauseonjoin  
    2=>pauseondisconnect

    SETTINGD VALUE for L3GBA API

    checkbox=>0(uncheck) | 1(checked)

*/


function parseSettings(msg){
    switch(msg[0]){
        case "0":

        break;
        case "1":

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
    }
}

function initCheckBoxes(){
    let pauseondisc = document.getElementById("setpauseondisc")
    pauseondisc.onchange=(ev)=>{
        if(ev.target.checked){
            socket.send("x_21")
        }else{
            socket.send("x_20")
        }
    }
}

initCheckBoxes()