

let wsAdd = "ws://"+location.hostname+":9091"
const socket = new WebSocket(wsAdd);
var clientUsername = ""

function onClickGo(){
	socket.send("s")
}

var onClickReady = () =>{
	let btn = document.getElementById("ready")
	socket.send("r_1")
	btn.className="ready"
	btn.onclick=onClickUnready
	document.getElementById("user-"+clientUsername).className="ready"
	checkAllReady()
}
var onClickUnready = () =>{
	let btn = document.getElementById("ready")
	socket.send("r_0")
	btn.className="unready"
	btn.onclick=onClickReady
	document.getElementById("user-"+clientUsername).className="unready"
}
function addUser(username, flag){
	let div = document.getElementById("users")
	if(flag){
		let name = username.substring(0,username.length-1)
		let newUser = document.createElement("span")
		newUser.id="user-"+name
		newUser.innerText=name
		if(username.substring(username.length-1)==0){
			newUser.className="unready"
		}else{
			newUser.className="ready"
		}
		div.append(newUser)
	}else{
		let child = document.getElementById("user-"+username)
		if (child){
			div.removeChild(child)
		}
		
	}
}

function setUserReady(username){
	let flag = username.substring(username.length-1)
	var name = username.substring(0,username.length-1)
	if(flag==1){
		document.getElementById("user-"+name).className="ready"
		checkAllReady()
	}else{
		document.getElementById("user-"+name).className="unready"
		return
	}
	
}

function checkAllReady(){
	if(document.getElementsByClassName("unready").length==0){
		document.getElementById("go").hidden=false
	}
}

function getCookie(cookiename) 
{
	// Get name followed by anything except a semicolon
	var cookiestring=RegExp(cookiename+"=[^;]+").exec(document.cookie);
	// Return everything after the equal sign, or an empty string if the cookie name not found
	return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}

let WSAuth = ()=>{
	let  token = getCookie('token');
	socket.send(token);
}

let parseAuth = (msg)=>{
	
	let data = msg.data
	if(data=="valid"){
		socket.removeEventListener("message", parseAuth)
		socket.addEventListener("message",L3GBAAPIParsing)
		let username= localStorage.getItem('username').substring(0,20)
		if(!username){
			username="anonymous"
			localStorage.setItem('username', username)
		}
		socket.send("n_"+username)
	}else if(data=="invalid"){
		window.location.href="/"
	}else{
		console.error("server didn't answered correctly to the auth process")
	}
}

let L3GBAAPIParsing=(data)=>{
	let code = data.data
	switch(code[0]){
		case "d":
			keyState[keyList[code[1]]][1] = 1
			break;
		case "u":
			keyState[keyList[code[1]]][1] = 0
			break;
		case "o":
			setPauseMenu(true, false)
			break;
		case "f":
			setPauseMenu(false, false)
			break;
		case "l":
			let userArray = code.substring(2).split("~")
			for(let i=0; i<userArray.length;i++){
				addUser(userArray[i], true)
			}
			break;
		case "q":
			addUser(code.substring(2), false)
			break;
		case "j":
			addUser(code.substring(2)+"0", true)
			break;
		case "n":
			clientUsername=code.substring(2)
			break;
		case "r":
			setUserReady(code.substring(2))
			break;
		case "s":
			startEmulation()
			break
		default:
			console.warn("API wise unknown server message %s",code)
	}
}

socket.onopen = WSAuth
socket.addEventListener("message",parseAuth);







