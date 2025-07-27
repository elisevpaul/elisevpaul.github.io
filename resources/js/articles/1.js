
  var article_1 = function() {
   console.log("article_1");
    var data = [1995, 2000, 2005, 2010, 2015, 2020];

    var width = 800;
    var height = 100;
    var timeline_scale = d3.scaleLinear()
      .domain([1995, 2020])
      .range([0, width]);
      
    //Create a simple timeline using D3.js
    var tl = d3.select(".timeline")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", function(d) { return timeline_scale(d); })
      .attr("y", 30)
      .text(function(d) { return d; });

    console.log(tl);
    console.log(timeline_scale);
    console.log(data);
  }
  document.addEventListener("DOMContentLoaded", function() {
    article_1();
  });