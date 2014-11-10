function ajaxRequest(callback, url) {   
	$.ajax({       
		type: "GET",
		crossOrigin: true,
		url: url,
		dataType : "json",
		success: callback,
		error:function() {   
			console.log("ajax request failed"); 
		}
	});     
}
