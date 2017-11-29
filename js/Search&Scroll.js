$("#returnBack").click(function () {
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    if (target.length) {
        $('html, body').animate({
            scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
    }
});

$("#search").on("keypress", function (e) {
    var code = e.keyCode || e.which;
    if(code==13){
        var keyword =$(this).val();
        var count = 0;
        $(".menu__item").each(function () {
            $(this).show();
           if ($(this).find("a").text().toLowerCase().includes(keyword.toLowerCase()) == false){
               $(this).hide();
           }
           else
               count++;
        });
        $("#searchResults").text("Totally ".concat(count.toString()).concat(" results."));
    }
});

$("#rotate").on("mousemove", function () {
    $("#clickHint").css("opacity", 1);
});

$("#rotate").on("mouseout", function () {
    $("#clickHint").css("opacity", 0);
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("souce", ev.path[0].id);
    if (ev.path[0].className == "menu__item"){
        ev.dataTransfer.setData("type", "university");
    }
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var source = ev.dataTransfer.getData("souce");
    var target = ev.target;
    var type = ev.dataTransfer.getData("type");
    if ($(target).attr("id") == "bipartite" && type == "university"){
        $("#university_list").append("<div class=\"list_piece\">"+source+"</div>");
    }
    console.log($(target).attr("id"));
    // if ($(target).attr("id") != "svg_part"){
    //     target.appendChild(document.getElementById(data));
    // }
    // else{
    console.log(source);
    // }
}