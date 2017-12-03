//var data1 = [
//	['Lite', 'CA', 16, 0],
//	['Small', 'CA', 1278, 4],
//	['Medium', 'CA', 27, 0],
//	['Plus', 'CA', 58, 0],
//	['Grand', 'CA', 1551, 15],
//	['Elite', 'CA', 141, 0],
//];


function bipartite(features,countries) {
	var myNode = document.getElementById("bp_body");
	while (myNode!=null &&myNode.firstChild!=null) {
	    myNode.removeChild(myNode.firstChild);
	}
	
	var unidata = new Array();	
	var guo_university= new Array();
	var guo_award = new Array();
	d3.csv("shanghaiData.csv", function(error, Orgdata) {
		
		if(error) throw error;
		var maxBound = 300;
		for(var i = 0,j=0; i < maxBound; i++) {
			var n = 0;
			guo_university[i]=Orgdata[i].university_name;
			guo_award[i]= Orgdata[i].award;
			if(countries.indexOf(Orgdata[i].university_name)>=0){
				for(var key in Orgdata[i]) {
					var size = features.length;
					if(features.indexOf(key)>=0){
						unidata[j * size + n] = new Array();
						unidata[j * size + n][0] = Orgdata[i].university_name;
						unidata[j * size + n][1] = key;
						unidata[j * size + n][2] = parseInt(Orgdata[i][key]);
							n++;
					}
				}
				j++;
			}
			else{
				if(countries.length==0){
					maxBound = 10;
					for(var key in Orgdata[i]) {
						var size = features.length;
						if(features.indexOf(key)>=0){
							unidata[j * size + n] = new Array();
							unidata[j * size + n][0] = Orgdata[i].university_name;
							unidata[j * size + n][1] = key;
							unidata[j * size + n][2] = parseInt(Orgdata[i][key]);
								n++;
						}
					}
					j++;
				}
				
			}
		}
		//var colorset = { Elite: "#3366CC", Grand: "#DC3912", Lite: "#FF9900", Medium: "#109618", Plus: "#990099", Small: "#0099C6" };
		var colorset = { alumni: "#3366CC", award: "#DC3912", hici: "#FF9900", ns: "#109618", pub: "#990099", pcp: "#0099C6" };

		var svg = d3.select("#bp_body").append("svg").attr("width", 1060).attr("height", 700);

		//	svg.append("text").attr("x", 650).attr("y", 70)
		//		.attr("class", "header").text("Sales Attempt");
		//
		//	svg.append("text").attr("x", 950).attr("y", 70)
		//		.attr("class", "header").text("Sales");

		var g = [
			svg.append("g").attr("transform", "translate(350,100)"),
			svg.append("g").attr("transform", "translate(750,100)")
		];
		
		function sortUniversity_Ascend(a,b){ return d3.ascending(guo_university.indexOf(a),guo_university.indexOf(b))}
		function sortUniversity_Descend(a,b){ return d3.descending(guo_university.indexOf(a),guo_university.indexOf(b))}
		function sortAward(a,b){ return d3.ascending(guo_award.indexOf(a),guo_award.indexOf(b))}
		
		var bp = [
			viz.bP()
			.data(unidata)
			.min(12)
			.pad(1)
			.height(550)
			.width(200)
			.barSize(35)
			.fill(d => colorset[d.secondary])
			.sortPrimary(sortUniversity_Ascend)
//			.sortSecondary(sortUniversity)
		];

		[0].forEach(function(i) {
			g[i].call(bp[i])

			g[i].append("text").attr("x", -50).attr("y", -8).style("text-anchor", "middle").text("Channel");
			g[i].append("text").attr("x", 250).attr("y", -8).style("text-anchor", "middle").text("State");

			g[i].append("line").attr("x1", -100).attr("x2", 0);
			g[i].append("line").attr("x1", 200).attr("x2", 300);

			g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", -100).attr("x2", 0);
			g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", 200).attr("x2", 300);

			g[i].selectAll(".mainBars")
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			g[i].selectAll(".mainBars").append("text").attr("class", "label")
				.attr("x", d => (d.part == "primary" ? -30 : 30))
				.attr("y", d => +6)
				.text(d => d.key)
				.attr("text-anchor", d => (d.part == "primary" ? "end" : "start"));

			g[i].selectAll(".mainBars").append("text").attr("class", "perc")
				.attr("x", d => (d.part == "primary" ? -300 : 80))
				.attr("y", d => +6)
				.text(function(d) { return d3.format("0.0%")(d.percent) })
				.attr("text-anchor", d => (d.part == "primary" ? "end" : "start"));
		});
		
//		bp[0].sortPrimary(sortUniversity_Descend);
//		g[1].call(bp[0])
//		$('#test').click(function(){
//				bp[0].sortPrimary(sortUniversity_Descend);
//				g[1].call(bp[0])
//				i=1
//				g[i].selectAll(".mainBars").append("text").attr("class", "label")
//				.attr("x", d => (d.part == "primary" ? -30 : 30))
//				.attr("y", d => +6)
//				.text(d => d.key)
//				.attr("text-anchor", d => (d.part == "primary" ? "end" : "start"));
//				
//			}
//		)
		function mouseover(d) {
			[0].forEach(function(i) {
				bp[i].mouseover(d);
				g[i].selectAll(".mainBars").select(".perc")
					.text(function(d) { return d3.format("0.0%")(d.percent) });
				
			});
		}

		function mouseout(d) {
			[0].forEach(function(i) {
				bp[i].mouseout(d);
				g[i].selectAll(".mainBars").select(".perc")
					.text(function(d) { return d3.format("0.0%")(d.percent) });
			});
		}

		d3.select(self.frameElement).style("height", "800px");

	});
}
function getChildStyles(thisobj) {
	var classNames = [];
	$("#current").children().each(function(i) {
		classNames[i] = $(this).attr('id');
	});
	return classNames;
}


var features = ["alumni","award","hici","ns","pub","pcp"]
var countries=[]
bipartite(features,countries);
