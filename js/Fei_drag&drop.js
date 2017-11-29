function allowDrop_Fei(ev) {
    ev.preventDefault();
}

function drag_Fei(ev) {
    ev.dataTransfer.setData("text_Fei", ev.target.id);
}

function drop_Fei(ev) {
    ev.preventDefault();
    var target_id = ev.dataTransfer.getData("text_Fei");
    ev.target.appendChild(document.getElementById(target_id));
}

//function dragend(){
//	alert("drop finished")
//	var myNode = document.getElementById("bp_body");
//	while (myNode.firstChild) {
//	    myNode.removeChild(myNode.firstChild);
//	}
//
//	thisP = $("#current");
//	var features = getChildStyles(thisP);
////	alert(features)
//	bipartite(features,countries);
//}

