/***** ALL MATH FUNCTIONS ****/

var to_radians = Math.PI / 180;
var to_degrees = 180 / Math.PI;


// Helper function: cross product of two vectors v0&v1
function cross(v0, v1) {
    return [v0[1] * v1[2] - v0[2] * v1[1], v0[2] * v1[0] - v0[0] * v1[2], v0[0] * v1[1] - v0[1] * v1[0]];
}

//Helper function: dot product of two vectors v0&v1
function dot(v0, v1) {
    for (var i = 0, sum = 0; v0.length > i; ++i) sum += v0[i] * v1[i];
    return sum;
}

// Helper function:
// This function converts a [lon, lat] coordinates into a [x,y,z] coordinate
// the [x, y, z] is Cartesian, with origin at lon/lat (0,0) center of the earth
function lonlat2xyz( coord ){

    var lon = coord[0] * to_radians;
    var lat = coord[1] * to_radians;

    var x = Math.cos(lat) * Math.cos(lon);

    var y = Math.cos(lat) * Math.sin(lon);

    var z = Math.sin(lat);

    return [x, y, z];
}

// Helper function:
// This function computes a quaternion representation for the rotation between to vectors
// https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
function quaternion(v0, v1) {

    if (v0 && v1) {

        var w = cross(v0, v1),  // vector pendicular to v0 & v1
            w_len = Math.sqrt(dot(w, w)); // length of w

        if (w_len == 0)
            return;

        var theta = .5 * Math.acos(Math.max(-1, Math.min(1, dot(v0, v1)))),

            qi  = w[2] * Math.sin(theta) / w_len;
        qj  = - w[1] * Math.sin(theta) / w_len;
        qk  = w[0]* Math.sin(theta) / w_len;
        qr  = Math.cos(theta);

        return theta && [qr, qi, qj, qk];
    }
}

// Helper function:
// This functions converts euler angles to quaternion
// https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
function euler2quat(e) {

    if(!e) return;

    var roll = .5 * e[0] * to_radians,
        pitch = .5 * e[1] * to_radians,
        yaw = .5 * e[2] * to_radians,

        sr = Math.sin(roll),
        cr = Math.cos(roll),
        sp = Math.sin(pitch),
        cp = Math.cos(pitch),
        sy = Math.sin(yaw),
        cy = Math.cos(yaw),

        qi = sr*cp*cy - cr*sp*sy,
        qj = cr*sp*cy + sr*cp*sy,
        qk = cr*cp*sy - sr*sp*cy,
        qr = cr*cp*cy + sr*sp*sy;

    return [qr, qi, qj, qk];
}

// This functions computes a quaternion multiply
// Geometrically, it means combining two quant rotations
// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/arithmetic/index.htm
function quatMultiply(q1, q2) {
    if(!q1 || !q2) return;

    var a = q1[0],
        b = q1[1],
        c = q1[2],
        d = q1[3],
        e = q2[0],
        f = q2[1],
        g = q2[2],
        h = q2[3];

    return [
        a*e - b*f - c*g - d*h,
        b*e + a*f + c*h - d*g,
        a*g - b*h + c*e + d*f,
        a*h + b*g - c*f + d*e];

}

// This function computes quaternion to euler angles
// https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
function quat2euler(t){

    if(!t) return;

    return [ Math.atan2(2 * (t[0] * t[1] + t[2] * t[3]), 1 - 2 * (t[1] * t[1] + t[2] * t[2])) * to_degrees,
        Math.asin(Math.max(-1, Math.min(1, 2 * (t[0] * t[2] - t[3] * t[1])))) * to_degrees,
        Math.atan2(2 * (t[0] * t[3] + t[1] * t[2]), 1 - 2 * (t[2] * t[2] + t[3] * t[3])) * to_degrees
    ]
}

/*  This function computes the euler angles when given two vectors, and a rotation
	This is really the only math function called with d3 code.

	v0 - starting pos in lon/lat, commonly obtained by projection.invert
	v1 - ending pos in lon/lat, commonly obtained by projection.invert
	o0 - the projection rotation in euler angles at starting pos (v0), commonly obtained by projection.rotate
*/

function eulerAngles(v0, v1, o0) {

    /*
        The math behind this:
        - first calculate the quaternion rotation between the two vectors, v0 & v1
        - then multiply this rotation onto the original rotation at v0
        - finally convert the resulted quat angle back to euler angles for d3 to rotate
    */

    var t = quatMultiply( euler2quat(o0), quaternion(lonlat2xyz(v0), lonlat2xyz(v1) ) );
    return quat2euler(t);
}


/**************end of math functions**********************/

var width = 960,
    height = 670,
    rotate = [10, -10],
    velocity = [.003, -.001],
    active = d3.select(null);
    time = Date.now();

var projection = d3.geoOrthographic()
    .scale(270)
    .translate([width / 2, height / 2])
    .clipAngle(90);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("id", "worldMap")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);
    // .on("mousedown", mousedown);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

var colorScale = d3.scaleQuantize()
    .domain([-1, 2.08])
    .range(colorbrewer.GnBu[9]);

svg.call(drag);
var total_university_data = "";
d3.json("data/world-countries.json", function(collection) {
    var COLOR_COUNTS = 27;
    d3.json("data/country_data.json", function (error, data) {
        if(error) throw error;
        total_university_data = data;
    });

    d3.csv("data/university_country_count.csv", function (error, data) {
        if (error) throw error;

        var country_count = new Map();
        var min = -1, max = 0;
        data.forEach(function (t) { 
            country_count.set(t["country"], Math.log(t["count"]));
            max = Math.max(max, Math.log(t["count"]));
        });

        var g = svg.append("g");
        svg.call(zoom);

        feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("svg:path")
            .attr("id", function (d) {
                return d.properties.name;
            })
            .attr("d", path)
            .style("fill", function (d) {
                return colorScale(country_count.get(d.properties.name));
            })
            .on("mousemove", function (d) {
                var html = "";

                html += "<div class=\"tooltip_kv\">";
                html += "<span class=\"tooltip_key\">";
                html += d.properties.name;
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
            .on("click", clicked)
            .on("mouseout", function() {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            });
    });
});


var toggle = true;
var feature = svg.selectAll("path");

var timer = d3.timer(function() {
    var dt = Date.now() - time;
    projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
    feature.attr("d", path);
});

function dragstarted() {
    timer.stop();
    gpos0 = projection.invert(d3.mouse(this));
    o0 = projection.rotate();
}

function dragged() {
        var xaxis = d3.event.pageX;
        var yaxis = d3.event.pageY;
        m1 = [xaxis, yaxis];
        // o1 = [o0[0] + (m1[0] - m0[0]) / 8, o0[1] + (m0[1] - m1[1]) / 8];
        var gpos1 = projection.invert(d3.mouse(this));
        o0 = projection.rotate();
        var o1 = eulerAngles(gpos0, gpos1, o0);
        try{
            projection.rotate(o1);
        }
        catch(error){
            var s = '';
        }
        // console.log(o1);
        svg.selectAll("path").attr("d", path);

}

function dragended() {
        var end = projection.rotate();
        // console.log(end);
        if (toggle) {
            time = Date.now();
            timer.restart(function() {
                var dt = Date.now() - time;
                projection.rotate([end[0] + velocity[0] * dt, end[1] + velocity[1] * dt, end[2]]);
                feature.attr("d", path);
            });
        }
        // m0 = null;
}

$('#rotate').click(function () {
    if (toggle){
        toggle = false;
        timer.stop();
        $('#button_change').removeClass("glyphicon-pause").addClass("glyphicon-play");
    }
    else{
        toggle = true;
        dragended();
        $('#button_change').removeClass("glyphicon-play").addClass("glyphicon-pause");
    }
});

function zoomed() {
    var g = d3.select("g");
    g.attr("transform", d3.event.transform);
}


function clicked(d) {
    if (active.node() === this) return reset();
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
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(2) );
    var countryName = $(this).attr("id");
    
    listUniversity(countryName);
    
}

function listUniversity(country) {
    $("#navigation").animate({width: 300});
    country_uni = total_university_data[country];
    var universityNumber = country_uni.length;
    $("#searchResults").text("Totally ".concat(universityNumber.toString()).concat(" results."));
    var html = "";
    country_uni.forEach(function (t) {
        html += "<li class=\"menu__item\" role=\"menuitem\" draggable=\"true\" ondragstart=\"drag(event)\" id=\"";
        html += t;
        html += "\"><a class=\"js-scroll-trigger\" href=\"#about\"> ";
        html += t;
        html += "</a></li>";
    });
    if (country_uni.length == 0){
        html += "<li class=\"menu__item\" role=\"menuitem\" ><a class=\"js-scroll-trigger\" href=\"#about\"> ";
        html += "No Result found in this Country!";
        html += "</a></li>";
    }
    $("#menuList").html(html);
    $('a.js-scroll-trigger').click(function() {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html, body').animate({
                scrollTop: (target.offset().top - 50)
            }, 1000, "easeInOutExpo");
            return false;
        }
    });
    
     //qifei
	UniversitiesArr = country_uni;
	thisP = $("#current");
	var features = getChildStyles(thisP);
	alert("---"+country_uni)
	//  bipartite(features,UniversitiesArr);
	bipartite(features,country_uni);
    //qifei end
    
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);
    $("#navigation").animate({width: 0});
    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity );
    var html = '';
    $("#menuList").html(html);
}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}