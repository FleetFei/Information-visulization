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
		//sort
		var uByAward = new Array();
	    var uByAlumni=new Array();
	    var uByHici=new Array();
	    var uByNs= new Array();
	    var uByPcp =new Array();
	    var uByPub =new Array();
	    
		for(var i = 0,j=0; i < maxBound; i++) {
			var n = 0;
			
//			guo_award[i]= Orgdata[i].award;
			if(countries.indexOf(Orgdata[i].university_name)>=0){
				guo_university.push(Orgdata[i].university_name)
				for(var key in Orgdata[i]) {
					var size = features.length;
					if(features.indexOf(key)>=0){
						unidata[j * size + n] = new Array();
						unidata[j * size + n][0] = Orgdata[i].university_name;
						unidata[j * size + n][1] = key;
						unidata[j * size + n][2] = parseInt(Orgdata[i][key]);
							n++;
					}
					if(key=='award'){
				   		uByAward.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])] );
				   	}
		            if(key=='alumni'){
		                uByAlumni.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])] );
		            }
		            if(key=='hici'){
		                uByHici.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
		            }
		            if(key=='ns'){
		                uByNs.push([Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
		            }
		            if(key=='pcp'){
		                uByPcp.push([Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
		            }
		            if(key=='pub'){
		                uByPub.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
		            }
				}
				j++;
			}
			else{
				if(countries.length==0){
					maxBound = 10;
					guo_university.push(Orgdata[i].university_name)
					for(var key in Orgdata[i]) {
						var size = features.length;
						if(features.indexOf(key)>=0){
							unidata[j * size + n] = new Array();
							unidata[j * size + n][0] = Orgdata[i].university_name;
							unidata[j * size + n][1] = key;
							unidata[j * size + n][2] = parseInt(Orgdata[i][key]);
								n++;
						}
						if(key=='award'){
				   		uByAward.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])] );
					   	}
			            if(key=='alumni'){
			                uByAlumni.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])] );
			            }
			            if(key=='hici'){
			                uByHici.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
			            }
			            if(key=='ns'){
			                uByNs.push([Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
			            }
			            if(key=='pcp'){
			                uByPcp.push([Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
			            }
			            if(key=='pub'){
			                uByPub.push( [Orgdata[i].university_name,parseInt(Orgdata[i][key])]);
		            		}
					}
					j++;
				}
				
			}
		}
		
		//guo dong
		function To1D(matrix) {
		  var ans = new Array();
		  for(var i=0;i<matrix.length;i++){
		   ans.push(matrix[i][0])
		  }
		  return ans;
		}
		
		
		 uByAward.sort(function (a,b) {
		  return a[1]>b[1]?1:0;
	   });
	    uByAlumni.sort(function (a,b) {
	        return a[1]>b[1]?1:0;
	    });
	    uByHici.sort(function (a,b) {
	            return a[1]>b[1]?1:0;
	       });
	    uByNs.sort(function (a,b) {
	            return a[1]>b[1]?1:0;
	       });
	    uByPcp.sort(function (a,b) {
	            return a[1]>b[1]?1:0;
	       });
	    uByPub.sort(function (a,b) {
	            return a[1]>b[1]?1:0;
	       });
	
	    var uByAward1d = To1D(uByAward);
	    var uByAlumni1d = To1D(uByAlumni);
	    var uByHici1d = To1D(uByHici);
	    var uByNs1d = To1D(uByNs);
	    var uByPcp1d = To1D(uByPcp);
	    var uByPub1d = To1D(uByPub);
		
		//guo dong end
		
		var colorset = { alumni: "#3366CC", award: "#DC3912", hici: "#FF9900", ns: "#109618", pub: "#990099", pcp: "#0099C6" };

		var svg = d3.select("#bp_body").append("svg").attr("width", 1060).attr("height", 700);

		//	svg.append("text").attr("x", 650).attr("y", 70)
		//		.attr("class", "header").text("Sales Attempt");
		//
		//	svg.append("text").attr("x", 950).attr("y", 70)
		//		.attr("class", "header").text("Sales");

		var g = [
			svg.append("g").attr("transform", "translate(350,100)").attr("id","test"),
		];
		
		// guo dong 
		function sortUniversity(a,b){ return d3.ascending(guo_university.indexOf(a),guo_university.indexOf(b)); }
	    function sortAward(a,b) { return d3.descending(uByAward1d.indexOf(a),uByAward1d.indexOf(b));}
	    function sortAlumni(a,b) { return d3.descending(uByAlumni1d.indexOf(a), uByAlumni1d.indexOf(b));}
	    function sortHici(a,b){ return d3.ascending(uByHici1d.indexOf(a),uByHici1d.indexOf(b)); }
	 	function sortNs(a,b) { return d3.descending(uByNs1d.indexOf(a),uByNs1d.indexOf(b));}
	 	function sortPcp(a,b) { return d3.descending(uByPcp1d.indexOf(a), uByPcp1d.indexOf(b));}
	    function sortPub(a,b) { return d3.descending(uByPub1d.indexOf(a), uByPub1d.indexOf(b));}
		
		// guo dong end
		
		var bp = [
			viz.bP()
			.data(unidata)
			.min(12)
			.pad(1)
			.height(550)
			.width(200)
			.barSize(35)
			.fill(d => colorset[d.secondary])
			.sortPrimary(sortUniversity)
//			.sortSecondary(sortUniversity)
		];

		[0].forEach(function(i) {
			g[i].call(bp[i])

			g[i].append("text").attr("x", -50).attr("y", -8).style("text-anchor", "middle").text("Universities");
			g[i].append("text").attr("x", 250).attr("y", -8).style("text-anchor", "middle").text("Attributes");

			g[i].append("line").attr("x1", -100).attr("x2", 0);
			g[i].append("line").attr("x1", 200).attr("x2", 300);

			g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", -100).attr("x2", 0);
			g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", 200).attr("x2", 300);

			g[i].selectAll(".mainBars")
//				.on("mouseover", mouseover)
//				.on("mouseout", mouseout);
				.on("click",update)

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

		//guo dong 
		function update(){
		  var label = $(this).find(".label").text();
		  switch (label){
		   case "award":
		                alert("Award")
		                bp[0].sortPrimary(sortAward);
		                $('#test').children().remove()
		                break;
		            case "alumni":
		                alert("alumni")
		                bp[0].sortPrimary(sortAlumni);
		                // $('.mainBars').remove()
		                $('#test').children().remove()
		                break;
		
		            case "hici":
		                alert("hici")
		                bp[0].sortPrimary(sortHici);
		                $('#test').children().remove()
		                break;
		            case "ns":
		                alert("ns")
		                bp[0].sortPrimary(sortNs);
		                $('#test').children().remove()
		                break;
		            case "pcp":
		                alert("pcp")
		                bp[0].sortPrimary(sortPcp);
		                $('#test').children().remove()
		                break;
		            case "pub":
		                alert("pub")
		                bp[0].sortPrimary(sortPub);
		                $('#test').children().remove()
		                break;
		  }
		
		        bp[0].update(unidata);
		  		i=0;
		        g[i].call(bp[i])
		
		        g[i].append("text").attr("x", -50).attr("y", -8).style("text-anchor", "middle").text("Channel");
		        g[i].append("text").attr("x", 250).attr("y", -8).style("text-anchor", "middle").text("State");
		
		        g[i].append("line").attr("x1", -100).attr("x2", 0);
		        g[i].append("line").attr("x1", 200).attr("x2", 300);
		
		        g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", -100).attr("x2", 0);
		        g[i].append("line").attr("y1", 610).attr("y2", 610).attr("x1", 200).attr("x2", 300);
		
		        g[i].selectAll(".mainBars")
		        // .on("mouseover", mouseover)
		        // .on("mouseout", mouseout);
		            .on("click", update);
		
		        g[0].selectAll(".mainBars")
		   		.append("text")
		   		.attr("class", "label")
		        .attr("x", d => (d.part == "primary" ? -30 : 30))
		      .attr("y", d => +6)
		      .text(d => d.key)
		      .attr("text-anchor", d => (d.part == "primary" ? "end" : "start"));
		
		        g[0].selectAll(".mainBars").append("text").attr("class", "perc")
		            .attr("x", d => (d.part == "primary" ? -300 : 80))
		      .attr("y", d => +6)
		      .text(function(d) { return d3.format("0.0%")(d.percent) })
		            .attr("text-anchor", d => (d.part == "primary" ? "end" : "start"));
		 }
		//guo dong end
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
