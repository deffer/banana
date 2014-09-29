iBookmarks.app.factory('mainService', function(backend, bookmarksShuffle){
	var service = {
		// data shared between all controllers
		bookmarkStore : bookmarksShuffle.useExampleStore(),
		authnInfo: {},
		signedIn: false,
		sessionToken : iBookmarks.sessionToken,

		convertFromServer : function(data){
			bookmarksShuffle.convertFromServer(data, service.bookmarkStore);
		},

		isUndefined : function(obj){
			return _.isUndefined(obj) || _.isNull(obj);
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
