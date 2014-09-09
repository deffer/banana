iBookmarks.app.BookmarksCtrl = ['$scope', '$http', '$rootScope', '$window', 'uploadManager', 'backend', 'bookmarksShuffle', 'mainService',
	function($scope, $http, $rootScope, $window, uploadManager, backend, bookmarksShuffle, mainService) {

	// div's visibility flags
	$scope.addBookmarkCollapsed = true;
	$scope.uploadFileCollapsed = true;
	$scope.editMode = false;

	// currently displayed bookmarks
	$scope.bookmarkStore = mainService.bookmarkStore;
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

			mainService.convertFromServer(results);

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
		console.log(bookmark);
		$rootScope.$broadcast('editBookmark', bookmark);
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
		// todo pass csrf token
		location.href=backend.GET_BOOKMARKS_URL; // NOT $window.open(backend.GET_BOOKMARKS_URL);
	};

	$rootScope.$on('successSignIn', function(e, data){
		$scope.getBookmarksFromServer();
	});

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

	/*$scope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
		$scope.showMe.show = (currentRoute.controller === IdentityCapture.app.favouritesController ||
			currentRoute.controller === IdentityCapture.app.allProfilesController);
	});*/
}];
