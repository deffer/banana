window.iBookmarks = window.iBookmarks || {};

iBookmarks.global =  angular.module('ib.global', []);
//iBookmarks.global.value('user', someGlobalObject);

iBookmarks.app = angular.module('igoogleApp', ['ui.bootstrap', 'ui.bootstrap.collapse', 'ui.select2']);

/*IdentityCapture.app.config(['$sceProvider', function($sceProvider) {
	$sceProvider.enabled(false);
}]);

IdentityCapture.app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/profile/:id/:key/:issue", {template: UOA.templates['capture/views/profile.html'], controller: IdentityCapture.app.profileController, reloadOnSearch: true})
		.when("/favourites", {template: UOA.templates['capture/views/profiles.html'], controller: IdentityCapture.app.favouritesController, reloadOnSearch: true})
		.when("/all-profiles", {template: UOA.templates['capture/views/profiles.html'], controller: IdentityCapture.app.allProfilesController, reloadOnSearch: true})
		.when("/password", {template: UOA.templates['capture/views/gen_password.html'], controller: IdentityCapture.app.genPasswordController})
		.otherwise({redirectTo: "/favourites"});

	$locationProvider.html5Mode(false);
}]);*/


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

