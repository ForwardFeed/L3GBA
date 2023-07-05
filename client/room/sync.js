

let wsAdd = "ws://" + location.hostname + ":9091"
var socket 
var clientUsername = localStorage.getItem("username")
var clientNumber;
var onReconnect = false

function Disconnected() {
	let users = document.getElementById("users")
	users.style.display = 'none'
	users.innerHTML=''
	let button = document.getElementById("reconnect")
	button.hidden=false
}

function Connected() {
	let users = document.getElementById("users")
	users.style.display = 'flex'
	let button = document.getElementById("reconnect")
	button.hidden=true
}

function tryReconnect(){
	document.getElementById("go").hidden = true
	onReconnect = true
	console.warn("trying to reconnect")
	var button = document.getElementById("reconnect")
	button.children[0].innerText="Trying to reconnect ..."
	startSocketListening()
	//prevent the user from spamming the button
	button.children[0].onclick=""
	setTimeout(() => {
		button.children[0].onclick=tryReconnect
		button.children[0].innerText="You have been disconnect\
	click this button to retry connection"
	}, 1500);
}
function reconnected(){
	let btn = document.getElementById("ready")
	btn.innerHTML = "click to ready"
	btn.classList.remove("ready")
	btn.classList.add("unready")
	btn.onclick = onClickReady
	let user = document.getElementById("user-" + clientNumber)
	user.classList.remove("user-ready")
	user.classList.add("user-unready")
	socket.send("r_0")
}
function onClickGo() {
	let btn = document.getElementById("go")
	socket.send("s")
	btn.innerText = "reset emulator"
	btn.onclick = onClickReset
}

function onClickReset() {
	socket.send("z")
}

var onClickReady = () => {
	let btn = document.getElementById("ready")
	btn.innerHTML = "click to unready"
	btn.classList.add("ready")
	btn.classList.remove("unready")
	btn.onclick = onClickUnready
	let user = document.getElementById("user-" + clientNumber)
	user.classList.add("user-ready")
	user.classList.remove("user-unready")
	socket.send("r_1")
	checkAllReady()
}
var onClickUnready = () => {
	let btn = document.getElementById("ready")
	btn.innerHTML = "click to ready"
	btn.classList.remove("ready")
	btn.classList.add("unready")
	btn.onclick = onClickReady
	let user = document.getElementById("user-" + clientUsername)
	user.classList.remove("user-ready")
	user.classList.add("user-unready")
	socket.send("r_0")
	document.getElementById("go").hidden = true
}
function addUser(userinfo, flag) {
	var username=userinfo[0]
	var userNumber = userinfo[1].substring(0, userinfo[1].length - 1);
	var status = userinfo[1].substring(userinfo[1].length - 1)
	var div = document.getElementById("users")
	if(username == clientUsername){
		clientNumber = userNumber
	}
	if (flag) {
		let newUser = document.createElement("span")
		newUser.id = "user-" + userNumber
		newUser.innerText = username
		if (status == 0) {
			newUser.className = "user-unready"
		} else {
			newUser.className = "user-ready"
		}
		div.append(newUser)
	} else {
		let child = document.getElementById("user-" + userNumber)
		if (child) {
			div.removeChild(child)
		}

	}
}

function setUserReady(username) {
	let flag = username.substring(username.length - 1)
	var name = username.substring(0, username.length - 1)
	if (flag == 1) {
		document.getElementById("user-" + name).className = "user-ready"
	} else {
		document.getElementById("user-" + name).className = "user-unready"
	}
	checkAllReady()

}

function checkAllReady() {
	let users = document.getElementsByClassName("user-unready")
	if(users.length>0){
		document.getElementById("go").hidden = true
		return false
	}
	document.getElementById("go").hidden = false
	return true
}

function getCookie(cookiename) {
	// Get name followed by anything except a semicolon
	var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
	// Return everything after the equal sign, or an empty string if the cookie name not found
	return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

let WSAuth = () => {
	console.log("connection to the server")
	Connected()//for the UI.
	let token = getCookie('token');
	if (!token) {
		window.location.href = "/"
		return
	}
	//set room name here
	let roomRE = /^[^~]+/
	let roomName = roomRE.exec(token)[0] || ""
	document.getElementById("room-name").innerText = "room " + roomName
	//finaly send the auth token to the server
	socket.send(token);
}

let parseAuth = (msg) => {

	let data = msg.data
	if (data == "valid") {
		socket.removeEventListener("message", parseAuth)
		socket.addEventListener("message", L3GBAAPIParsing)
		socket.send("g")
		if(onReconnect){
			reconnected()
		}
	} else if (data == "invalid") {
		window.location.href = "/"
	} else if (data == "in use") {
		alert("an user with this username is already present in this room")
		window.location.href = "/"
	} else {
		console.error("server didn't answered correctly to the auth process")
	}
}

let L3GBAAPIParsing = (data) => {
	let code = data.data
	switch (code[0]) {
		case "d":
			inputs.setKeyState(Number(code.substring(1)), 1, 1, false)
			break;
		case "u":
			inputs.setKeyState(Number(code.substring(1)), 1, 0, false)
			break;
		case "o":
			setPauseMenu(true, false)
			break;
		case "f":
			setPauseMenu(false, false)
			break;
		case "l":
			let userArray = code.substring(2, code.length-1).split("~")
			for (let i = 0; i < userArray.length; i++) {
				let userInfo = userArray[i].split("#")
				addUser(userInfo ,true)
			}
			break;
		case "q":
			addUser(code.substring(2).split("#"), false)
			if (roomSettings[2] == 1) {
				setPauseMenu(true, false)
			}
			break;
		case "j":
			addUser(code.substring(2).split("#"), true)
			if (roomSettings[1] == 1) {
				setPauseMenu(true, false)
			}
			checkAllReady()
			break;
		case "r":
			setUserReady(code.substring(2))
			break;
		case "s":
			if (!isRunning) {
				startEmulation()
				let btn = document.getElementById("go")
				btn.innerText = "reset emulator"
				btn.onclick = onClickReset
			}
			break
		case "x":
			parseSettings(code.substring(2))
			break;
		case "a":
			parseAllSettings(code.substring(2))
			break;
		case "z":
			startEmulation()
			break;
		default:
			console.warn("API wise unknown server message %s", code)
	}
}

function startSocketListening(){
	/* it will trigger an error if the server crashed
		TODO! needs to be handled */
	socket = new WebSocket(wsAdd);
	socket.onopen = WSAuth
	socket.addEventListener("message", parseAuth);
	socket.onclose = () => {
		console.error("disconnected from the ws server")
		Disconnected()
	}
}

startSocketListening()




