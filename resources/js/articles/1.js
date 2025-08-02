var dataset_map = {
  'main': '',
  'traffic delay': 'annual_person_hours_of_traffic_delay_per_commuter.csv',
  'operation costs': 'average_cost_of_owning_and_operating_a_vehicle.csv',
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
  async function draw_average_cost_ownership() {
    //ok this is sorta similar to draw_traffic_delay_graph.
    // our x axis is still year.
    // and y is current dollars.
    // the fixed costs are one bar, variable cost is another.
    // then there is a line for the average total cost per 15000 miles in current dollars
    const data = await d3.csv("resources/datasets/" + dataset_map['operation costs']);
    console.log('Parsed CSV data:', data);
    console.log(data[1]);
    // Get the specific rows by their position in the CSV
    // Line 2 (index 1) = years header
    // Line 8 (index 7) = total cost row
    // Line 9 (index 8) = variable cost row  
    // Line 10 (index 9) = fixed cost row
    const yearsHeader = data[0]; // Line 2
    const totalCostRow = data[5]; // Line 8
    const variableCostRow = data[6]; // Line 9
    const fixedCostRow = data[7]; // Line 10
    
    console.log('Years header:', yearsHeader);
    console.log('Total cost row:', totalCostRow);
    console.log('Variable cost row:', variableCostRow);
    console.log('Fixed cost row:', fixedCostRow);
    
    // Get years from the header row (skip first empty column)
    const years = Object.keys(yearsHeader).filter(key => {
      const year = parseInt(key);
      return !isNaN(year) && year >= 2000 && year <= 2024;
    });
    
    console.log('Years:', years);
    
    console.log('Found rows:', {
      totalCostRow: totalCostRow ? 'found' : 'not found',
      variableCostRow: variableCostRow ? 'found' : 'not found', 
      fixedCostRow: fixedCostRow ? 'found' : 'not found'
    });
    
    // Check if we have valid data before proceeding
    if (!totalCostRow || !variableCostRow || !fixedCostRow) {
      console.error('Missing required data rows');
      return;
    }
    
    // Process the data for each year
    const processedData = [];
    console.log('Years array:', years);
    console.log('Total cost row keys:', Object.keys(totalCostRow));
    console.log('Total cost row values:', totalCostRow);
    console.log('Variable cost row values:', variableCostRow);
    console.log('Fixed cost row values:', fixedCostRow);
    
    for (let i = 0; i < years.length; i++) {
      const year = parseInt(years[i]);
      const yearIndex = i + 1; // Skip column 0, start at column 1
      console.log(`Processing year ${year}, index: ${yearIndex}`);
      
      if (!isNaN(year) && year >= 2000 && year <= 2024) {
        const totalCost = parseFloat(totalCostRow[year].replace(/,/g, '')) || 0;
        const variableCost = parseFloat(variableCostRow[year].replace(/,/g, '')) || 0;
        const fixedCost = parseFloat(fixedCostRow[year].replace(/,/g, '')) || 0;
        
        console.log(`Year ${year}: total=${totalCost}, variable=${variableCost}, fixed=${fixedCost}`);
        
        if (totalCost > 0) {
          processedData.push({
            year: year,
            totalCost: totalCost,
            variableCost: variableCost,
            fixedCost: fixedCost
          });
        }
      }
    }
    
    console.log('Processed data:', processedData);
    
    // Check if we have valid data before proceeding
    if (processedData.length === 0) {
      console.error('No valid data found');
      return;
    }
    
    // Set up the SVG
    const margin = { top: 40, right: 30, bottom: 40, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Clear any existing SVG
    d3.select('#slide_2 svg').remove();

    const svg = d3.select('#slide_2')
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(processedData.filter(d => d.year >= 2000 && d.year <= 2024).map(d => d.year))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, 14000])
      .range([height, 0]);
    
    // Create color scale for the bars
    const colorScale = d3.scaleOrdinal()
      .domain(['fixed', 'variable'])
      .range(['#ff7f0e', '#2ca02c']);
    
    // Add bars for fixed and variable costs
    const barWidth = xScale.bandwidth() / 2;
    
    // Fixed cost bars
    svg.selectAll('.fixed-bar')
      .data(processedData)
      .enter().append('rect')
      .attr('class', 'fixed-bar')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.fixedCost))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.fixedCost))
      .attr('fill', colorScale('fixed'))
      .attr('opacity', 0.8);
    
    // Variable cost bars
    svg.selectAll('.variable-bar')
      .data(processedData)
      .enter().append('rect')
      .attr('class', 'variable-bar')
      .attr('x', d => xScale(d.year) + barWidth)
      .attr('y', d => yScale(d.variableCost))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.variableCost))
      .attr('fill', colorScale('variable'))
      .attr('opacity', 0.8);
    
    // Add line for total cost
    const line = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.totalCost));
    
    svg.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#d62728")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Add dots for total cost points
    svg.selectAll('.total-dot')
      .data(processedData)
      .enter().append('circle')
      .attr('class', 'total-dot')
      .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.totalCost))
      .attr('r', 4)
      .attr('fill', '#d62728');
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => '$' + d3.format(',.0f')(d)));
    
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
      .text("Cost (Current Dollars)");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Average Cost of Vehicle Ownership (1975-2024)");
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 20)`);
    
    // Fixed cost legend
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", colorScale('fixed'));
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Fixed Cost");
    
    // Variable cost legend
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", colorScale('variable'));
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("Variable Cost");
    
    // Total cost legend
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 50)
      .attr("x2", 15)
      .attr("y2", 50)
      .attr("stroke", "#d62728")
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 55)
      .text("Total Cost");
  }
  async function draw_traffic_delay_state_map() {
    //setup map json
    //https://billmill.org/making_a_us_map.html
    const res = await fetch(`https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json`)
    const mapdata = await res.json()
   
    const data = await d3.csv("resources/datasets/" + dataset_map['traffic delay']);

    const svg = d3.select('#slide_3 svg')
    .attr("width", 800)
    .attr("height", 400)
      ;
  

        const projection = d3.geoIdentity()
        .reflectY(false) // TopoJSON uses flipped Y-axis
        .fitSize([600, 400], topojson.feature(mapdata, mapdata.objects.states));
        
        
      const path = d3.geoPath(projection);

    const usa = svg
      .append('g')
      .append('path')
      .datum(topojson.feature(mapdata, mapdata.objects.nation))
      .attr('d', path)
      ;

    const state = svg
      .append('g')
      .attr('stroke', '#444')
      .attr('fill', '#eee')
      .selectAll('path')
      .data(topojson.feature(mapdata, mapdata.objects.states).features)
      .join('path')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('d', path);
    
    // Get the years from the data (columns 2 onwards are years)
    const years = Object.keys(data[0]).filter(key => key !== 'Urban area' && key !== 'Population group');
    const yearRange = years.map(year => parseInt(year)).filter(year => !isNaN(year));
    
    // Function to update the map for a specific year
    function updateMap(year) {
      // State abbreviation to full name mapping
      const stateAbbreviations = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
      };
      
      // Debug: Log the first row to see column names
      if (data.length > 0) {
        console.log("First row keys:", Object.keys(data[0]));
        console.log("Sample urban area:", data[0]['Urban area ']);
      }
      
      // Calculate average delay for each state for the given year
      const stateData = topojson.feature(mapdata, mapdata.objects.states).features.map(state => {
        // Check if state has a name property
        console.log("CHECKING STATER");
        console.log(state);
        console.log(state.properties.name);
        if (!state.properties || !state.properties.name) {
          return {
            ...state,
            delay: 0
          };
        }
        
        // Find matching urban areas for this state using both full name and abbreviations
        const matchingAreas = data.filter(row => {
          if (!row['Urban area ']) return false;
          
          const urbanArea = row['Urban area '].toLowerCase();
          const stateName = state.properties.name.toLowerCase();
          
          // Check for full state name
          if (urbanArea.includes(stateName)) return true;
          
          // Check for state abbreviation
          for (const [abbr, fullName] of Object.entries(stateAbbreviations)) {
            if (fullName.toLowerCase() === stateName && urbanArea.includes(abbr.toLowerCase())) {
              return true;
            }
          }
          
          return false;
        });
        
        // Debug: Log matching areas for first few states
        if (state.properties.name === 'California' || state.properties.name === 'Texas' || state.properties.name === 'New York') {
          console.log(`Matching areas for ${state.properties.name}:`, matchingAreas.length);
          if (matchingAreas.length > 0) {
            console.log("Sample matching area:", matchingAreas[0]['Urban area ']);
          }
        }
        
        let totalDelay = 0;
        let count = 0;
        
        matchingAreas.forEach(area => {
          const delay = parseFloat(area[year]) || 0;
          if (delay > 0) {
            totalDelay += delay;
            count++;
          }
        });
        
        const avgDelay = count > 0 ? totalDelay / count : 0;
        
        return {
          ...state,
          delay: avgDelay
        };
      });
      
      // Calculate max delay for scaling
      const maxDelay = d3.max(stateData, d => d.delay);
      
      // Create radius scale
      const radiusScale = d3.scaleLinear()
        .domain([0, maxDelay])
        .range([1, 25]); // Min 1px, max 25px radius
      
      // Create color scale (green -> yellow -> red)
      const colorScale = d3.scaleLinear()
        .domain([0, maxDelay * 0.5, maxDelay])
        .range(['#00ff00', '#ffff00', '#ff0000']); // Green -> Yellow -> Red
      
      // Remove existing circles
      svg.selectAll('.delay-circle').remove();
      
      // Add circles for delay visualization at state centroids
      svg.selectAll('.delay-circle')
        .data(stateData)
        .enter().append('circle')
        .attr('class', 'delay-circle')
        .attr('cx', d => path.centroid(d)[0])
        .attr('cy', d => path.centroid(d)[1])
        .attr('r', d => radiusScale(d.delay)) // Scale radius based on delay
        .attr('fill', d => d.delay > 0 ? colorScale(d.delay) : 'transparent')
        .attr('opacity', 0.7);
      
      // Update year display
      svg.selectAll('.year-display').remove();
      svg.append('text')
        .attr('class', 'year-display')
        .attr('x', 400)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`Traffic Delay - ${year}`);
    }
    
    // Create slider container on the right
    const sliderContainer = svg.append('g')
      .attr('transform', `translate(650, 50)`);
    
    const sliderWidth = 100;
    const sliderHeight = 20;
    
    // Slider track
    sliderContainer.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', sliderWidth)
      .attr('height', sliderHeight)
      .attr('fill', '#ddd')
      .attr('rx', 10);
    
    // Slider handle
    const sliderHandle = sliderContainer.append('circle')
      .attr('cx', 0)
      .attr('cy', sliderHeight/2)
      .attr('r', 10)
      .attr('fill', '#666')
      .attr('cursor', 'pointer');
    
    // Year labels
    sliderContainer.append('text')
      .attr('x', sliderWidth/2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Year');
    
    sliderContainer.append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text(yearRange[0]);
    
    sliderContainer.append('text')
      .attr('x', sliderWidth)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text(yearRange[yearRange.length - 1]);
    
    // Play button
    const playButton = sliderContainer.append('rect')
      .attr('x', 0)
      .attr('y', 60)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', '#4CAF50')
      .attr('rx', 5)
      .attr('cursor', 'pointer')
      .style('pointer-events', 'all'); // Ensure clicks are captured
    
    const playButtonText = sliderContainer.append('text')
      .attr('x', 20)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'white')
      .attr('class', 'play-button-text')
      .text('Play');
    
    // Slider functionality
    let currentYearIndex = 0;
    let isPlaying = false;
    let playInterval;
    
    function updateSliderPosition() {
      const x = (currentYearIndex / (yearRange.length - 1)) * sliderWidth;
      sliderHandle.attr('cx', x);
      updateMap(yearRange[currentYearIndex]);
    }
    
    // Slider drag behavior
    const drag = d3.drag()
      .on('drag', function(event) {
        const x = Math.max(0, Math.min(sliderWidth, event.x));
        const index = Math.round((x / sliderWidth) * (yearRange.length - 1));
        currentYearIndex = index;
        updateSliderPosition();
      });
    
    sliderHandle.call(drag);
    
    // Play button functionality - try both click and mousedown events
    playButton
      .on('click', function(event) {
        console.log('Play button clicked!'); // Debug log
        event.stopPropagation(); // Prevent event bubbling
        if (isPlaying) {
          // Stop playing
          isPlaying = false;
          clearInterval(playInterval);
          playButton.attr('fill', '#4CAF50');
          playButtonText.text('Play');
        } else {
          // Start playing
          isPlaying = true;
          playButton.attr('fill', '#f44336');
          playButtonText.text('Stop');
          
          playInterval = setInterval(() => {
            currentYearIndex = (currentYearIndex + 1) % yearRange.length;
            updateSliderPosition();
          }, 500); // Update every 500ms
        }
      })
      .on('mousedown', function(event) {
        console.log('Play button mousedown!'); // Debug log
        event.stopPropagation(); // Prevent event bubbling
      });
    
    // Initialize with first year
    updateSliderPosition();
  }
  draw_traffic_delay_graph();
  draw_average_cost_ownership();
  draw_traffic_delay_state_map();
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