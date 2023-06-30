
function AcceptCookies(yes){
    if(yes != "yes"){
        HumanNotHappyWithCookie()
        return
    }
    HumanHappyWithCookies()
}

function HumanHappyWithCookies(){
    localStorage.setItem('cookies', 'ok')
    document.getElementById("cookies").style.display='none';
    document.getElementById("room-div").style.display='flex';
}

function HumanNotHappyWithCookie(){
    document.getElementById("cookies").innerHTML="Suit Yourself"
}

function checkCookieAccepted(){
    let cookieOK = localStorage.getItem('cookies')
    if(cookieOK=='ok'){
        HumanHappyWithCookies()
    }else{
        document.getElementById("room-div").style.display='none';
    }
}
checkCookieAccepted()

