var width = 1200,
    height = 920;
    active = d3.select(null);
var projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

var colorScale = d3.scaleQuantize()
    .domain([ 0, 6.2 ])
    .range(colorbrewer.GnBu[6]);

var legendScale = d3.scaleQuantize()
    .domain([ 0, 475 ])
    .range(colorbrewer.GnBu[6]);
var colorLegend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .scale(legendScale)
    .shapePadding(5)
    .shapeWidth(50)
    .shapeHeight(20)
    .labelOffset(12);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var totalPaper = "", names = new Map(),
    linkMap = new Map(), keywordMap = new Map();
d3.csv("data/state_count.csv", function (error, data) {
    if (error) throw error;
    // console.log(data);

    d3.json("data/link.json", function (error, data) {
        if(error) throw error;
        data.forEach(function (t) {
            linkMap.set(t["Title"], t["Link"]) ;
        });
    });

    d3.json("data/keyword.json", function (error, data) {
        if(error) throw error;
        data.forEach(function (t) {
            keywordMap.set(t["Title"], t["Keywords"]) ;
        });
    });

    d3.json("data/stateData.json", function (error, paperData) {
        totalPaper = paperData;
    });

    var min = 0, max = 475;
    var stateCount = new Map();
    data.forEach(function (t) {
        stateCount.set(t["State"], Math.log(t["Count"]));

    });

    d3.json("data/us state.json", function(error, us) {
        if (error) throw error;

        var state_data = topojson.feature(us, us.objects.states).features;
        d3.tsv("data/us_state_names.tsv", function (tsv) {
            tsv.forEach(function (d, i) {
                names.set(d.id, d.name);
            });
            var g = svg.append("g")
                .attr("width", width)
                .attr("height", height);
            svg.call(zoom);

            g.selectAll("path")
                .data(state_data)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "states")
                .attr("id", function (d) {
                    return names.get(d.id.toString());
                })
                .style("fill", function (d) {
                    if (d.id < 57) {
                        return colorScale(stateCount.get(names.get(d.id.toString())));
                    }
                })
                .on("click", clicked)
                .on("mousemove", function (d) {
                    var html = "";

                    html += "<div>";
                    html += "<span class=\"tooltip_key\">";
                    html += names.get(d.id.toString());
                    html += "</span>";
                    html += "</div>";

                    $("#tooltip-container").html(html);
                    $(this).attr("fill-opacity", "0.8");
                    $("#tooltip-container").show();

                    var coordinates = d3.mouse(this);
                    var tooltip_width = $("#tooltip-container").width();
                    d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 15) + "px")
                        .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
                })
                .on("mouseout", function() {
                    $(this).attr("fill-opacity", "1.0");
                    $("#tooltip-container").hide();
                });

            g.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", path);

            function clicked(d) {
                var name = $(this).attr("id");
                if (active.node() === this) return reset();
                console.log(name);
                active.classed("active", false);
                active = d3.select(this).classed("active", true);

                var bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    translate = [width / 2 - 2 * x, height / 2 - 2 * y];

                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(2));

                listPaer(name);
            }
            svg.append("g")
                .attr("transform", "translate(1000, 60)")
                .call(colorLegend);
        });
    });

});

var totalData = new Map();
function listPaer(state) {
    $("#navigation").animate({width: 300});
    // console.log(filePath);
    statePaper = totalPaper[state];
    var paperNumber = statePaper.length;
    $("#searchResults").text("Totally ".concat(paperNumber.toString()).concat(" results."));
    var html = "";
    statePaper.forEach(function (t) {
        var paper = {};
        html += "<li class=\"menu__item\" role=\"menuitem\" ><a class=\"js-scroll-trigger\" href=\"#about\"> ";
        html += t["Title"];
        html += "</a></li>";
        // console.log(linkMap.get(t["Title"]));
        // console.log(t);
        paper["Journal"] = t["Journal"];
        paper["Year"] = t["Year"];
        paper["Abstract"] = t["Abstract"];
        paper["Address"] = t["Address"];
        paper["Authors"] = t["Authors"];
        totalData.set(t["Title"], paper);
    });
    if (statePaper.length == 0){
        html += "<li class=\"menu__item\" role=\"menuitem\" ><a class=\"js-scroll-trigger\" href=\"#about\"> ";
        html += "No paper published in this state";
        html += "</a></li>";
    }
    // console.log(totalData);
    $("#menuList").html(html);
    $('a.js-scroll-trigger').click(function() {
        var title = $.trim($(this).text());
        var paperContent = "";
        paperContent += "<div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h2><strong>Title:  </strong><a class=\"link2paper\"" +
            "style=\"cursor:pointer\">";
        paperContent += title;
        paperContent += "</a></h2></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Authors:  </strong>";
        paperContent += totalData.get(title)["Authors"];
        paperContent += "</h4></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Address:  </strong>";
        paperContent += totalData.get(title)["Address"];
        paperContent += "</h4></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Journal:  </strong>";
        paperContent += totalData.get(title)["Journal"];
        paperContent += "</h4></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Year:  </strong>";
        paperContent += totalData.get(title)["Year"];
        if (keywordMap.has(title)){
            paperContent += "</h4></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Keywords:  </strong>";
            paperContent += keywordMap.get(title);
        }
        paperContent += "</h4></div></div><div class=\"row\"><div class=\"col-lg-10 mx-auto\"><h4><strong>Abstract:  </strong>";
        paperContent += totalData.get(title)["Abstract"];
        paperContent += "</h4></div></div><div class=\"row\">";
        $("#paper_detail").html(paperContent);
        $(".link2paper").click(function () {
            window.open(linkMap.get($(this).text()));
        });
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html, body').animate({
                scrollTop: (target.offset().top - 50)
            }, 1000, "easeInOutExpo");
            return false;
        }
    });
}

function zoomed() {
    var g = d3.select("g");
    g.attr("transform", d3.event.transform);
}

function reset() {
    $("#details").css("opacity", 0);
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity );
    $("#navigation").animate({width: 0});
    $("#menuList").html("");
}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

$("#buttonHome").click(function () {
    window.location.href="index.html";

});
