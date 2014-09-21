iBookmarks.app.BookmarksCtrl = ['$scope', '$http', '$rootScope', '$window', 'uploadManager', 'backend', 'bookmarksShuffle', 'mainService', 'alertsService',
	function($scope, $http, $rootScope, $window, uploadManager, backend, bookmarksShuffle, mainService, alertsService) {

	// div's visibility flags
	$scope.addBookmarkCollapsed = true;
	$scope.uploadFileCollapsed = true;
	$scope.editMode = false;

	// currently displayed bookmarks
	$scope.bookmarkStore = mainService.bookmarkStore;


	$scope.selectedFolder =  bookmarksShuffle.folderAll;
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
			return _.pluck($scope.bookmarkStore.foldersList, 'id')
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
		var modifying = null;
		if (!_.isUndefined($scope.currentInputId)){
			if ($scope.suggestedBookmark && ($scope.suggestedBookmark.id == $scope.currentInputId))
				modifying = $scope.suggestedBookmark;
			else
				modifying = bookmarksShuffle.getBookmark($scope.currentInputId);
		}

		backend.saveBookmark($scope.inputTitle, $scope.inputUrl, $scope.inputLabels, $scope.currentInputId).then(
			function(data){
				console.log(data);
				var match = bookmarksShuffle.updateAfterBookmarkChanged(data, modifying);
				if (!match){
					alertsService.addInfo("Your bookmark has been saved",
						["Please note that you wouldn't see this bookmark because of your current filter"]);
				}else{
					alertsService.addNotice("Your bookmark has been saved");
				}
			}, function(error){
				alertsService.addError('Server error', ['Unable to save bookmark. Please try again later']);
			});
		$scope.closeQuickAdd();
	};


	$scope.getBookmarksFromServer = function () {
		backend.getBookmarks(mainService.sessionToken).then(function (results) {
			if (_.isUndefined(results) || _.isEmpty(results) || _.isNull(results) || results == 'null') {
				console.log("Empty response. IGNORE.");
				alertsService.addInfo("You don't have any saved bookmarks.",
					[
						"You can browse example bookmarks or start adding new.",
						"To import from your own google bookmarks XML file, go to 'Edit' -> 'Import from file'",
						"You can also use this import with the JSON file you previously exported"
					]);
				return;
			}
			console.log("Updating folders");

			mainService.convertFromServer(results);

			$scope.selectedFolder = $scope.bookmarkStore.displayFolders.length>1?
				$scope.bookmarkStore.displayFolders[1] : $scope.bookmarkStore.displayFolders[0];
			console.log("Selected folder is "+$scope.selectedFolder.id);
			$scope.uploadFileCollapsed = true;
		}, function(rejection){
			alertsService.addError("Unable to load bookmarks from server. Please try again later")
		});
	};

	$scope.setSelectedFolder = function(folder){
		$scope.selectedFolder = folder;
	};

	$scope.$watch('selectedFolder', function () {
		$scope.selectedBookmarks = $scope.bookmarkStore.folders[$scope.selectedFolder.id];
	});

	$scope.$watch('inputUrl', function () {
		if ($scope.editMode){
			return;
		}
		console.log("Reacting on change "+$scope.inputUrl);
		$scope.suggestedBookmark = bookmarksShuffle.checkBookmarkExists($scope.inputUrl);
	});

	$scope.populateSuggested = function(){
		$scope.currentInputId = $scope.suggestedBookmark.id;
		$scope.inputTitle = $scope.suggestedBookmark.title;
		$scope.inputLabels = $scope.suggestedBookmark.listFolders;
		// $scope.suggestedBookmark = null; // keep suggestion for when we want to detect Edit vs. Add
	};

	$scope.closeQuickAdd = function(){
		$scope.currentInputId = null;
		$scope.inputUrl = "";
		$scope.inputTitle = "";
		$scope.inputLabels = [];
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
		var filter = $scope.filterInput.split(" ");
		bookmarksShuffle.filterByPartial(filter);
		$scope.bookmarkStore.filterOn = true;
		$scope.bookmarkStore.filter = filter;

		$scope.setSelectedFolder(bookmarksShuffle.getFolderById($scope.selectedFolder.id));
		$scope.selectedBookmarks = $scope.bookmarkStore.folders[$scope.selectedFolder.id]; // refresh current
	};

	$scope.clearFilter = function(){
		$scope.filterInput = "";
		if ($scope.bookmarkStore.filterOn){
			bookmarksShuffle.clearFilter($scope.bookmarkStore);
			$scope.setSelectedFolder(bookmarksShuffle.getFolderById($scope.selectedFolder.id));
			$scope.selectedBookmarks = $scope.bookmarkStore.folders[$scope.selectedFolder.id]; // refresh current
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
		location.href=backend.DOWNLOAD_BOOKMARKS_URL; // NOT $window.open(backend.DOWNLOAD_BOOKMARKS_URL);
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
