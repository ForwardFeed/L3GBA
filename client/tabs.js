var ex_tab //existent tab
{   
    let div = document.getElementById('tabs-buttons')
    let contDiv=document.getElementById('tabs-content')
    ex_tab=contDiv.children[0]

    //switch tab
    let sTab = (ev)=>{
        ex_tab.hidden = true
        ex_tab=contDiv.children[ev.target.value]
        ex_tab.hidden = false

    }

    for(let i=0; i<div.children.length;i++){
        div.children[i].value=i
        div.children[i].onclick=sTab
        div.children[i].style.height=100/div.children.length+"%"
    }
    
}

