myApp.directive('quickAdd', ['bookmarksShuffle', function (bookmarksShuffle) {
	return {
		restrict: 'A',
		scope: {
			addGoogleBookmarkFunc : "=",
			onUrlChangeFunc: "=",
			suggestedBookmark : "="
		},

		// own scope: select2Options, inputUrl, inputTitle, inputLabels
		link: function (scope, element, attrs) {
			scope.select2Options = {
				'multiple': true, 'simple_tags': true, 'tokenSeparators': [",", " "],
				'tags': ["123", "abc", "xyz"]
			};
		}
	};
}]);