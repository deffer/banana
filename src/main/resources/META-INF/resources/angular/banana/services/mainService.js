iBookmarks.app.factory('mainService', function(backend, bookmarksShuffle){
	var service = {
		// data shared between all controllers
		bookmarkStore : bookmarksShuffle.getExampleStore(),
		authnInfo: {},
		sessionToken : undefined,

		convertFromServer : function(data){
			bookmarksShuffle.convertFromServer(data, service.bookmarkStore);
		}
	};
	return service;
});
