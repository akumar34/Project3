function getWeather(render, city, state){
	var url = "http://api.wunderground.com/api/f38af855c3e044fa/geolookup/conditions/q/" + state + "/" + city + ".json";
	ajaxRequest(render,url);
}