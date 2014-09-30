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
	$scope.currentInputId = null;  // indicates a bookmark being modified, if null - new bookmark
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
		if (!mainService.isUndefined($scope.currentInputId)){
			modifying = bookmarksShuffle.getBookmark($scope.currentInputId);
			console.log("Saving a change to the entry "+$scope.currentInputId);
			console.log(modifying);
			console.log($scope.currentInputId+" - '"+$scope.inputTitle+"'  ["+$scope.inputLabels+"] "+ $scope.inputUrl);
		}else{
			console.log("Adding entry "+$scope.currentInputId+" - '"+$scope.inputTitle+"'  ["+$scope.inputLabels+"] "+ $scope.inputUrl);
		}

		backend.saveBookmark($scope.inputTitle, $scope.inputUrl, $scope.inputLabels, $scope.currentInputId).then(
			function(data){
				console.log(data);
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

				$scope.closeQuickAdd();
			}, function(error){
				alertsService.addError('Server error', ['Unable to save bookmark. Please try again later']);
				$scope.closeQuickAdd();
			});
	};


	$scope.getBookmarksFromServer = function () {
		backend.getBookmarks().then(function (results) {
			if (_.isUndefined(results) || _.isEmpty(results) || _.isNull(results) || results == 'null') {
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

	$scope.$watch('selectedFolder', function () {
		$scope.selectedBookmarks = $scope.bookmarkStore.folders[$scope.selectedFolder.id];
	});

	$scope.$watch('inputUrl', function () {
		console.log("Reacting on change "+$scope.inputUrl);
		$scope.suggestedBookmark = bookmarksShuffle.checkBookmarkExists($scope.inputUrl); // TODO [add currently modifying bookmark to skip thi match
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
		uploadManager.upload();
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
