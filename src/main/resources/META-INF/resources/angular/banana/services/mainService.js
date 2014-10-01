iBookmarks.app.factory('mainService', function(backend, bookmarksShuffle, helperService){
	var service = {
		// data shared between all controllers
		bookmarkStore : bookmarksShuffle.useExampleStore(),
		authnInfo: {},
		signedIn: false,
		sessionToken : iBookmarks.sessionToken,
		helper: helperService,

		convertFromServer : function(data){
			bookmarksShuffle.convertFromServer(data, service.bookmarkStore);
		},

		setSignedIn: function(authnInfo){
			service.signedIn = true;
			service.authnInfo = authnInfo;
		},

		setLogOut: function(){
			service.signedIn = false;
			service.authnInfo = {};
		}

	};

	backend.sessionToken = service.sessionToken;
	return service;
});
