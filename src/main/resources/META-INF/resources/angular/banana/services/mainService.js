iBookmarks.app.factory('mainService', function(backend, bookmarksShuffle){
	var service = {
		// data shared between all controllers
		bookmarkStore : bookmarksShuffle.useExampleStore(),
		authnInfo: {},
		sessionToken : iBookmarks.sessionToken,

		convertFromServer : function(data){
			bookmarksShuffle.convertFromServer(data, service.bookmarkStore);
		},

		isUndefined : function(obj){
			return _.isUndefined(obj) || _.isNull(obj);
		}
	};

	backend.sessionToken = service.sessionToken;
	return service;
});
