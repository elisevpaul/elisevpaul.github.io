(function() {
	
	function init() {
		document.querySelectorAll("div[include-html]").forEach(function(div) {
			var file_name = div.getAttribute("include-html");
			fetch(file_name)
				.then(response => response.text())
				.then(data => {
					div.innerHTML = data;
				})
				.catch(error => console.error('Error fetching file:', error));
		});
	}
	
	// simulate jquery document ready function
	document.addEventListener("DOMContentLoaded", function() {
		init();
	});
	
})();