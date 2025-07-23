
var data = [1995, 2000, 2005, 2010, 2015, 2020];

var width = 800;
var height = 100;
var timeline_scale = d3.scaleLinear()
  .domain([1995, 2020])
  .range([0, width]);
  
// Create a simple timeline using D3.js
var tl = d3.select(".timeline")
  .data(data)
  .enter()
  .append("p")
 .html(function(d) {
	return "<span style='position: absolute; left: " + timeline_scale(d) + "px;'>" + d + "</span>";
  });


console.log(tl);
console.log(timeline_scale);
console.log(data);