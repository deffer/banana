function askServer(name){
	$.ajax({
	    url: "/rest/age/"+name,
	    type: "POST",	
		dataType: "json",  		
	    success: function(data){
		console.log(data)
	    	$("#answer").text(name+" is "+data.answer)
	    }	
	})
}