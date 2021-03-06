iBookmarks.app.factory('backend', function ($q, $http) {

	var backend = {
		sessionToken: null,   // is set by mainService
		DOWNLOAD_BOOKMARKS_URL : 'download/',

		callUtils: function (action, input, input2) {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.utils,
				data: {action: action, input: input, input2: input2}}).
				success(function(data, status, headers, config) {
					defer.resolve(data);
				}).error(function(data, status, headers, config) {
					defer.reject({});
				});
			return promise;
		},

		getBookmarks: function () {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.get,
				data: {sessionToken: backend.sessionToken}}).
				success(function(data, status, headers, config) {
					defer.resolve(data);
				}).
				error(function(data, status, headers, config) {
					defer.reject({});
				});
			return promise;
		},

		downloadBookmarks: function () {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.download,
				data: {sessionToken: backend.sessionToken}}).
				success(function(data, status, headers, config) {
					console.log(data);
					defer.resolve(data.temporaryCode);
				}).
				error(function(data, status, headers, config) {
					console.log(data);
					defer.reject({});
				});
			return promise;
		},

		saveBookmark: function (title, url, labels, id) {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.change,
				data: {action: 'save', id: id, title: title, url: url, labels: labels, sessionToken: backend.sessionToken}}).
				success(function(data, status, headers, config) {
					defer.resolve(data);
				}).
				error(function(data, status, headers, config) {
					defer.reject({});
				});
			return promise;
		},

		deleteBookmark: function (id) {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.change,
				data: {action: 'delete', id: id, sessionToken: backend.sessionToken}}).
				success(function(data, status, headers, config) {
					defer.resolve(data);
				}).
				error(function(data, status, headers, config) {
					defer.reject({});
				});
			return promise;
		},

		authenticate: function (userid, code) {
			var defer = $q.defer();
			var promise = defer.promise;
			$http({method: 'POST', url: UOA.endpoints.bookmarks.gplusauth,
				data: {"userid": userid, "code":code, sessionToken: backend.sessionToken}}).
				success(function(data, status, headers, config) {
					defer.resolve(data);
				}).
				error(function(data, status, headers, config) {
					defer.reject({});
				});
			return promise;
		},

		getGoogleBookmarks : function(){
			//www.google.com/bookmarks/?output=xml
			$http({method: 'jsonp', url: 'http://www.google.com/bookmarks/?output=xml',
				transformResponse: function(data, headersGetter){
					console.log(data);
					return data.toString();
				}
			}).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				console.log(data);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				console.log(""+status);
			});
		}
	};
	return backend;
});

