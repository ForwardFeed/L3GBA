var ex_tab //existent tab
{   
    let dark = "#bcbbba"
    let light = "#efeded"

    let div = document.getElementById('tabs-buttons')
    let contDiv=document.getElementById('tabs-content')
    ex_tab=contDiv.children[0]
    ex_btn=div.children[0]
    ex_btn.style.backgroundColor=dark

    

    //switch tab
    let sTab = (ev)=>{
        ex_tab.hidden = true
        ex_btn.style.backgroundColor=light
        ex_tab=contDiv.children[ev.target.value]
        ex_tab.hidden = false
        ex_btn=div.children[ev.target.value]
        ex_btn.style.backgroundColor=dark
        
    }

    for(let i=0; i<div.children.length;i++){
        div.children[i].value=i
        div.children[i].onclick=sTab
        div.children[i].style.height=100/div.children.length+"%"
    }
    
}

