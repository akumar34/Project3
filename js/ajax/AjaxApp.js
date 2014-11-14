function ajaxRequest(callback, url) {   
	$.ajax({       
		type: "GET",
		url: "https://jsonp.nodejitsu.com/?url=" + url,
		dataType : "json",
		success: callback,
		error:function() {   
			console.log("ajax request failed"); 
		}
	});     
}
