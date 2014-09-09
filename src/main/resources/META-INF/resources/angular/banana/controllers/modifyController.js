iBookmarks.app.ModifyCtrl = ['$scope', '$rootScope', '$window', '$timeout', 'backend', 'bookmarksShuffle', 'mainService',
	function($scope, $rootScope, $window, $timeout, backend, bookmarksShuffle, mainService) {

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

	// for Add Bookmark
	$scope.currentInputId = null;
	$scope.inputUrl = "";
	$scope.inputTitle = "";
	$scope.inputLabels = null;
	$scope.suggestedBookmark = null;

	$scope.select2Options = {
		'multiple': true, 'simple_tags': true, 'tokenSeparators': [",", " "],
		'tags': function(){
			return _.pluck($scope.bookmarkStore.folders, 'id')
		}
	};

	/**
	 * Centered position for element
	 */
	$scope.topPosition = function(height) {
		var top = $(window).scrollTop() + ($(window).height() / 2 - (height / 2));
		return top;
	};

	$scope.topPos = function() {
		var height = angular.element("#addBookmarkModalBox").height();
		return $scope.topPosition(height);
	};

	$scope.openAddBookmark = function () {

		$timeout(function(){
			var height = angular.element("#addBookmarkModalBox").height();
			var top = $scope.topPosition(height);
			var cont = angular.element("#addBookmarkModalContainer");
			cont.css('top', top+"px");
		}, 100);

		$scope.addBookmarkCollapsed = false;
	};

	$scope.openImport = function () {
		$scope.uploadFileCollapsed = false;
		$scope.addBookmarkCollapsed = true;
	};

	$scope.saveBookmark = function () {
		var id = $scope.currentInputId;
		backend.saveBookmark($scope.inputTitle, $scope.inputUrl, $scope.inputLabels, $scope.currentInputId).then(function(results){
		   console.log(results);
		});
		$scope.closeQuickAdd();
		$rootScope.$broadcast('bookmarkChanged', id);
	};

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


	$rootScope.$on('editBookmark', function(e, bookmark){
		console.log("Asked to save");
		console.log(bookmark);
		$scope.openAddBookmark();
	});

}];
