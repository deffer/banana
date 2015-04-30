iBookmarks.app.BookmarksCtrl = ['$scope', '$http', '$rootScope', '$window', 'uploadManager', 'backend', 'bookmarksShuffle', 'mainService', 'alertsService',
	function($scope, $http, $rootScope, $window, uploadManager, backend, bookmarksShuffle, mainService, alertsService) {

	// div's visibility flags
	$scope.uploadFileCollapsed = true;
	$scope.editMode = false;

	// currently displayed bookmarks
	$scope.bookmarkStore = mainService.bookmarkStore;

	$scope.selectedFolder =  bookmarksShuffle.folderAll;
	$scope.selectedBookmarks = [];

	$scope.filterInput = "";

	// for Import Bookmarks
	$scope.uploadFileName = "";
	$scope.files = [];
	$scope.percentage = 0;

	$scope.openImport = function () {
		$scope.uploadFileCollapsed = false;
	};

	$scope.getBookmarksFromServer = function () {
		backend.getBookmarks().then(function (results) {
			if (mainService.helper.isEmpty(results)) {
				console.log("Empty response.");
				alertsService.addInfo("You don't have any saved bookmarks.",
					[
						"You can browse example bookmarks or start adding new. Examples will be removed automatically once you add your first record.",
						"To import from your own google bookmarks XML file, go to 'Edit' -> 'Import from file'",
						"You can also use this import with the JSON file you previously exported"
					]).code=alertsService.CODE_NO_BOOKMARKS;
				return;
			} else{
				alertsService.dismissAllWithCode(alertsService.CODE_NO_BOOKMARKS);
			}

			$scope.loadBookmarks(results);

		}, function(rejection){
			alertsService.addError("Unable to load bookmarks from server. Please try again later")
		});
	};

	$scope.loadBookmarks = function(bookmarks){
		mainService.convertFromServer(bookmarks);
		$scope.bookmarkStore.example = false;
		$scope.selectedFolder = $scope.bookmarkStore.displayFolders.length>1?
			$scope.bookmarkStore.displayFolders[1] : $scope.bookmarkStore.displayFolders[0];
		console.log("Selected folder is "+$scope.selectedFolder.id);
		$scope.uploadFileCollapsed = true;
	};

	$scope.setSelectedFolder = function(folder){
		$scope.selectedFolder = folder;
	};

	$scope.onChangeSelectedFolder = function(){
		$scope.selectedBookmarks = $scope.bookmarkStore.folders[$scope.selectedFolder.id];
	};

	$scope.validFilter = function(){
		return $scope.filterInput && $scope.filterInput.length>2
	};

	$scope.filterKeypress = function(ev) {
		$scope.filterAction();
	};

	$scope.filterAction = function(){
		var filter = $scope.filterInput.toLowerCase().split(" ");
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

	$scope.newBookmark = function(){
		$rootScope.$broadcast('newBookmark');
	};

	$scope.editBookmark = function(bookmark){
		$rootScope.$broadcast('editBookmark', bookmark);
	};

	$scope.deleteBookmark = function(bookmark){
		backend.deleteBookmark(bookmark.id).then(function(data){
			bookmarksShuffle.updateAfterBookmarkDeleted(bookmark);
			alertsService.addPopup("Your bookmark has been deleted");
		}, function(error){
			alertsService.addError("Error deleting bookmark", [error]);
		});
	};

	$scope.canUpload = function(){
		return uploadManager.fileCount() > 0
	};

	$scope.upload = function () {
		var promise = uploadManager.upload();
		promise.then(function (e) {
			alertsService.addPopup("Upload completed successfully!");
		}, function(error){
			alertsService.addAlert({message:error.statusText, type: 'error'}, true);
		});
		$scope.files = [];
	};

	$scope.export2JSON = function(){
		//location.href=backend.DOWNLOAD_BOOKMARKS_URL; // NOT $window.open(backend.DOWNLOAD_BOOKMARKS_URL);
		backend.downloadBookmarks().then(function(temporaryCode){
			location.href=backend.DOWNLOAD_BOOKMARKS_URL + temporaryCode;
		}, function(rejection){
			alertsService.addError("Download failed. Please try again");
		});
	};

	$scope.onBookmarkSaved = function(e, data, modifying){
		alertsService.dismissAllWithCode(alertsService.CODE_NO_BOOKMARKS);
		var details = [];
		var match = true;
		if ($scope.bookmarkStore.example && mainService.signedIn){
			details.push("Example bookmarks have been removed");
			$scope.loadBookmarks([data]);
			match = bookmarksShuffle.matchesFilter(data, $scope.bookmarkStore.filter);
		}else{
			match = bookmarksShuffle.updateAfterBookmarkChanged(data, modifying);
		}
		if (!match){
			details.push("Please note that you wouldn't see this bookmark because of your current filter");
		}
		if (_.isEmpty(details))
			alertsService.addPopup("Your bookmark has been saved");
		else
			alertsService.addInfo("Your bookmark has been saved", details).code=alertsService.CODE_NO_BOOKMARKS;
	};

	$scope.onBookmarkSaveFailed = function(e, error){
		alertsService.addError('Server error', ['Unable to save bookmark. Please try again later']);
	};

	$scope.$watch('selectedFolder', $scope.onChangeSelectedFolder);

	$rootScope.$on('bookmarkSaved', $scope.onBookmarkSaved);
	$rootScope.$on('bookmarkSaveFailed', $scope.onBookmarkSaveFailed);

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
			// See uploadManager.upload() function for alternative handling of response status
			console.log('Upload finished! (progress 100%)');
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
