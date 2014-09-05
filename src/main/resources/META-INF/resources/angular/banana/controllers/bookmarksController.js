iBookmarks.app.BookmarksCtrl = ['$scope', '$http', '$rootScope', '$window', 'uploadManager', 'backend', 'bookmarksShuffle',
	function($scope, $http, $rootScope, $window, uploadManager, backend, bookmarksShuffle) {

	$scope.sessionToken = UOA.sessionToken; // TODO instead of additional token, just use xsrfHeaderName and xsrfCookieName

	// div's visibility flags
	$scope.addBookmarkCollapsed = true;
	$scope.uploadFileCollapsed = true;
	$scope.editMode = false;

	// authenticatoin info
	$scope.signedIn = false;
	$scope.authnInfo = {};

	// currently displayed bookmarks
	$scope.bookmarkStore = bookmarksShuffle.getExampleStore();
	/*
	$scope.urlsMap = backend.getExampleUrlsMap();      // { url1: [bId1, bId2], url2: [bId1, bId3]}
	$scope.folders = backend.getExampleFolders();      // [ {id: abc, name: alphabet},  {id: xyz, name: else}]
	$scope.bookmarks = backend.getExampleBookmarks();  // { abc: [b1, b2, b3],  xyz: [b1]}
    */

	$scope.selectedFolder = "Development";
	$scope.selectedBookmarks = [];

	$scope.filterInput = "";

	// for Add Bookmark
	$scope.currentInputId = null;
	$scope.inputUrl = "";
	$scope.inputTitle = "";
	$scope.inputLabels = null;
	$scope.suggestedBookmark = null;

	// for Import Bookmarks
	$scope.uploadFileName = "";
	$scope.files = [];
	$scope.percentage = 0;

	$scope.select2Options = {
		'multiple': true, 'simple_tags': true, 'tokenSeparators': [",", " "],
		'tags': function(){
			return _.pluck($scope.bookmarkStore.folders, 'id')
		}
	};


	$scope.openAddBookmark = function () {
		$scope.uploadFileCollapsed = true;
		$scope.addBookmarkCollapsed = false;
	};

	$scope.openImport = function () {
		$scope.uploadFileCollapsed = false;
		$scope.addBookmarkCollapsed = true;
	};

	$scope.addGoogleBookmark = function () {
		backend.saveBookmark($scope.inputTitle, $scope.inputUrl, $scope.inputLabels, $scope.currentInputId).then(function(results){
		   console.log(results);
		});
		$scope.closeQuickAdd();
	};


	$scope.getBookmarksFromServer = function () {
		backend.getBookmarks().then(function (results) {
			if (_.isUndefined(results) || _.isEmpty(results) || _.isNull(results) || results == 'null') {
				console.log("Empty response. IGNORE.");
				return;
			}
			console.log("Updating folders");

			//var prepared =
			bookmarksShuffle.convertFromServer(results, $scope.bookmarkStore);

			$scope.selectedFolder = $scope.bookmarkStore.folders.length ? $scope.bookmarkStore.folders[0].id : 0;
			console.log("Selected folder is "+$scope.selectedFolder);
			$scope.uploadFileCollapsed = true;
		});
	};

	$scope.setSelectedFolder = function(selection){
		$scope.selectedFolder = selection;
	};

	$scope.$watch('selectedFolder', function () {
		$scope.selectedBookmarks = $scope.bookmarkStore.bookmarks[$scope.selectedFolder];
	});

	$scope.$watch('inputUrl', function () {
		if ($scope.editMode){
			return;
		}
		console.log("Reacting on change "+$scope.inputUrl);
		$scope.suggestedBookmark = bookmarksShuffle.checkBookmarkExists($scope.bookmarkStore, $scope.inputUrl);
	});

	$scope.populateSuggested = function(){
		$scope.currentInputId = $scope.suggestedBookmark.id;
		$scope.inputTitle = $scope.suggestedBookmark.title;
		$scope.inputLabels = $scope.suggestedBookmark.listFolders;
		$scope.suggestedBookmark = null;
	};

	$scope.closeQuickAdd = function(){
		$scope.currentInputId = null;
		$scope.inputUrl = "";
		$scope.inputTitle = "";
		$scope.inputLabels = null;
		$scope.suggestedBookmark = null;

		$scope.addBookmarkCollapsed=true;
	};

	$scope.validFilter = function(){
		return $scope.filterInput && $scope.filterInput.length>2
	};

	$scope.filterKeypress = function(ev) {
		$scope.filterAction();
	};

	$scope.filterAction = function(){
		bookmarksShuffle.filterByPartial($scope.bookmarkStore, $scope.filterInput.split(" "));
		$scope.bookmarkStore.filterOn = true;
		$scope.selectedBookmarks = $scope.bookmarkStore.bookmarks[$scope.selectedFolder]; // refresh current
	};

	$scope.clearFilter = function(){
		$scope.filterInput = "";
		if ($scope.bookmarkStore.filterOn){
			bookmarksShuffle.clearFilter($scope.bookmarkStore);
			$scope.selectedBookmarks = $scope.bookmarkStore.bookmarks[$scope.selectedFolder]; // refresh current
		}
	};

	$scope.editBookmark = function(bookmark){
		console.log("Asked to save");
		console.log(bookmark)
	};

	$scope.deleteBookmark = function(bookmark){
		console.log("Asked to delete");
		console.log(bookmark)
	};

	$scope.canUpload = function(){
		return uploadManager.fileCount() > 0
	};

	$scope.upload = function () {
		uploadManager.upload();
		$scope.files = [];
	};

	$scope.export2JSON = function(){
		location.href=backend.GET_BOOKMARKS_URL; // NOT $window.open(backend.GET_BOOKMARKS_URL);
	};

	$scope.proceedLogin = function () {
		var request = gapi.client.plus.people.get({'userId': 'me'});
		request.execute(function (profile) {
			$scope.$apply(function () {
				$scope.signedIn = true;
				$scope.authnInfo.name = profile.displayName;
				$scope.authnInfo.userid = profile.id;
				console.log("user id: "+profile.id); // ex. 102477976455620241458
				backend.authenticate(profile.id, $scope.authnInfo.code, $scope.sessionToken)
					.then($scope.getBookmarksFromServer);
			});
		});
	};

	$scope.logOut = function () {
		// see also http://stackoverflow.com/questions/14723383/google-logout-using-api-javascript-jquery

		$http({method: 'jsonp', url: 'https://accounts.google.com/o/oauth2/revoke?token=' + $scope.authnInfo['access_token']})
			.success(function (data, status, headers, config) {
				//$scope.signedIn = false;
				//$scope.authResult = {};
				$window.location.reload();
			})
			.error(function (data, status, headers, config) {
				console.log("Error, status " + status, " data " + data);
				$window.location.reload();
			});
	};

	$scope.onSignInCallback = function (authResult) {
		if (authResult['access_token']) {
			$scope.authnInfo = authResult; // The user is signed in
			gapi.client.load('plus', 'v1', $scope.proceedLogin);
		} else if (authResult['error']) {
			$scope.$apply(function () {
				$scope.signedIn = false;
			});
			// There was an error, which means the user is not signed in.
			console.log('There was an error: ' + authResult['error']);
		}

		console.log("Callback: " + authResult['access_token']);
	};

	onSignInCallback = $scope.onSignInCallback;  // a hack for sign in button

	$rootScope.$on('fileAdded', function (e, call) {
		$scope.files.push(call);
		$scope.uploadFileName = call;
		$scope.$apply();
	});

	$rootScope.$on('uploadProgress', function (e, call) {
		if (call > 100) {
			console.log('Upload finished!');
			$scope.percentage = 0;
			$scope.getBookmarksFromServer();
		} else {
			$scope.percentage = call;
		}
		$scope.$apply();
	});
}];
