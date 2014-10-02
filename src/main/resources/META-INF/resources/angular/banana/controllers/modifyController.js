iBookmarks.app.ModifyCtrl = ['$scope', '$rootScope', '$window', '$timeout', 'backend', 'bookmarksShuffle', 'mainService',
	function($scope, $rootScope, $window, $timeout, backend, bookmarksShuffle, mainService) {

	// div's visibility flags
	$scope.visible = false;

	// currently displayed bookmarks
	$scope.bookmarkStore = mainService.bookmarkStore;

	// for Add Bookmark
	$scope.currentInputId = null;
	$scope.inputUrl = "";
	$scope.inputTitle = "";
	$scope.inputLabels = null;
	$scope.suggestedBookmark = null;

	$scope.select2Options = {
		'multiple': true, 'simple_tags': true, 'tokenSeparators': [",", " "],
		'tags': function(){
			return _.pluck($scope.bookmarkStore.foldersList, 'id')
		}
	};


	$scope.saveBookmark = function(){
		var modifying = null;
		if (!mainService.helper.isNotDefined($scope.currentInputId)){
			modifying = bookmarksShuffle.getBookmark($scope.currentInputId);
			console.log("Saving a change to the entry "+$scope.currentInputId);
			console.log(modifying);
			console.log($scope.currentInputId+" - '"+$scope.inputTitle+"'  ["+$scope.inputLabels+"] "+ $scope.inputUrl);
		}else{
			console.log("Adding entry "+$scope.currentInputId+" - '"+$scope.inputTitle+"'  ["+$scope.inputLabels+"] "+ $scope.inputUrl);
		}

		backend.saveBookmark($scope.inputTitle, $scope.inputUrl, $scope.inputLabels, $scope.currentInputId).then(
			function(data){
				$rootScope.$broadcast('bookmarkSaved', data, modifying);
				$scope.close();
			}, function (error){
				$rootScope.$broadcast('bookmarkSaveFailed', error);
				$scope.close();
			}
		);
	};

	$scope.$watch('inputUrl', function () {
		if (!$scope.inputUrl)
			return;

		$scope.suggestedBookmark = bookmarksShuffle.checkBookmarkExists($scope.inputUrl, $scope.currentInputId);
		if (!$scope.suggestedBookmark && !$scope.currentInputId && !$scope.inputTitle){
			var guess = mainService.helper.guessUrlTitle($scope.inputUrl);
			if (guess)
				$scope.inputTitle = guess;
		}
	});

	$scope.populate = function(suggestedBookmark){
		$scope.populate($scope.suggestedBookmark);
		$scope.suggestedBookmark = null;
	};

	$scope.populate = function(suggestedBookmark){
		$scope.currentInputId = suggestedBookmark.id;
		$scope.inputUrl = suggestedBookmark.url;
		$scope.inputTitle = suggestedBookmark.title;
		$scope.inputLabels = suggestedBookmark.labels;
	};

	/**
	 * Centered position for element
	 */
	$scope.topPosition = function(height) {
		return $(window).scrollTop() + ($(window).height() / 2 - (height / 2));
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

		$scope.visible = true;
	};


	$scope.close = function(){
		$scope.currentInputId = null;
		$scope.inputUrl = "";
		$scope.inputTitle = "";
		$scope.inputLabels = null;
		$scope.suggestedBookmark = null;

		$scope.visible = false;
	};


	$rootScope.$on('editBookmark', function(e, bookmark){
		console.log(bookmark);
		$scope.populate(bookmark);
		$scope.openAddBookmark();
	});

	$rootScope.$on('newBookmark', function(e){
		$scope.openAddBookmark();
	});

}];
