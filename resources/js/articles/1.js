var dataset_map = {
  'main': '',
  'traffic delay': 'annual_person_hours_of_traffic_delay_per_commuter.csv',
  'operation costs': '',
  'fuel waste': ''
}


var show_slide = function(slide_id) {
  console.log("showing slide " + slide_id);
  const new_slide = document.getElementById("slide_" + slide_id);
  const slides = document.querySelectorAll('.slide');
  Array.from(slides).forEach(slide=>{
    slide.style.display = 'none';
  })

  new_slide.style.display = 'block';
};


var init_event_triggers = function() {
  const slide_buttons = document.querySelectorAll('.slide_button');
  Array.from(slide_buttons).forEach((slide_button, index)=>{
    slide_button.addEventListener("click", function() {
      show_slide(index);
    });
  })
};

var draw_visualizations = function() {
  console.log("drawing visualizations with d3");
  // loop through our dataset map.
  // draw a graph based on the file with the same name in resources/datasets
  // use d3 for all illustrations
  // dynamically guess graph type based on dataset.
};


var add_annotations = function() {
  console.log("adding additional info");
  //add annotations to the graphs for additional info.
};



var load_page = function() {
  show_slide(0 );
  draw_visualizations();
  add_annotations();
  init_event_triggers();
}
document.addEventListener("DOMContentLoaded", function() {
  load_page();
});