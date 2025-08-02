var dataset_map = {
  'main': '',
  'traffic delay': 'annual_person_hours_of_traffic_delay_per_commuter.csv',
  'operation costs': '',
  'fuel waste': ''
}

//SCENE
var show_slide = function(slide_id) {
  /*
    The scenes should follow a template for visual consistency and follow an order to best convey the message
  */
  
  console.log("showing slide " + slide_id);
  const new_slide = document.getElementById("slide_" + slide_id);
  const slides = document.querySelectorAll('.slide');
  Array.from(slides).forEach(slide=>{
    slide.style.display = 'none';
  })

  new_slide.style.display = 'block';
  
  
  
  const all_buttons = document.querySelectorAll('.slide_button');
  Array.from(all_buttons).forEach((button, index)=>{
    if (index === slide_id) {
      button.classList.add('active_button');
    } else {
      button.classList.remove('active_button');
    }
  })
};

// TRIGGER
var init_event_triggers = function() {
  /* 
    The triggers connect user interface actions to changes in parameters that change 
    the state of the narrative visualization.
    These triggers can be event listeners (callback functions) that change parameter 
    values and then update the display to reflect the result of the event. 
  */
  const slide_buttons = document.querySelectorAll('.slide_button');
  Array.from(slide_buttons).forEach((slide_button, index)=>{
    slide_button.addEventListener("click", function() {
      show_slide(index);
    });
  })
};

var draw_visualizations = function() {
  console.log("drawing visualizations with d3");
  
  async function draw_traffic_delay_graph() {
    const data = await d3.csv("resources/datasets/" + dataset_map['traffic delay']);
    console.log(data);
    
    // Get the years from the data (columns 2 onwards are years)
    const years = Object.keys(data[0]).filter(key => key !== 'Urban area' && key !== 'Population group');
    
    // Calculate average for each year across all urban areas
    const yearlyAverages = years.map(year => {
      const values = data
        .filter(row => row[year] !== undefined && row[year] !== '')
        .map(row => parseFloat(row[year]));
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { year: parseInt(year), average: average };
    });
    
    console.log('Yearly averages:', yearlyAverages);
    
    // Set up the SVG
    const margin = { top: 40, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Clear any existing SVG
    d3.select('#slide_1 svg').remove();
    
    const svg = d3.select('#slide_1')
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(yearlyAverages, d => d.year), d3.max(yearlyAverages, d => d.year)])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yearlyAverages, d => d.average)])
      .range([height, 0]);
    
    // Add the line
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.average));
    
    // Add the line path
    svg.append("path")
      .datum(yearlyAverages)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add dots for each data point
    svg.selectAll(".dot")
      .data(yearlyAverages)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.average))
      .attr("r", 4)
      .attr("fill", "steelblue");
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add axis labels
    svg.append("text")
      .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .text("Year");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average Annual Hours of Traffic Delay per Commuter");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Traffic Delay Trends (1982-2022)");
  }
  // async function draw_average_cost_ownership() {
  //   //ok this is sorta similar to draw_traffic_delay_graph.
  //   // our x axis is still year.
  //   // and y is current dollars.
  //   // the fixed costs are one bar, variable cost is another.
  //   // then there is a line for the average total cost per 15000 miles in current dollars
    
  // }
  draw_traffic_delay_graph();
};

// ANNOTATE
var add_annotations = function() {
  console.log("adding additional info");
  //add annotations to the graphs for additional info.
  /*
  The annotations should follow a template for visual consistency from scene to scene. 
  These annotations should also highlight and reinforce specific data items or trends
   that make the important points for the desired messaging of the narrative visualization. 
   The lessons on d3 popups can be helpful on how to to make and place annotations, 
   but as an annotation, they should appear as part of the scene and not have to wait for a mouseover event.
  */
};



var load_page = function() {
  show_slide(0 );
  draw_visualizations();
  add_annotations();
  init_event_triggers();
}
document.addEventListener("DOMContentLoaded", function() {
  console.log('load page');
  load_page();
});