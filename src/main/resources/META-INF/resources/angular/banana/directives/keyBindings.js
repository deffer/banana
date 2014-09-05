iBookmarks.app.directive('ngOnEnter',function(){

	var linkFn = function(scope,element,attrs) {
		element.bind("keypress", function(e) {
			if (e.keyCode == 13 || e.keyCode == 10) {
				scope.$apply(function() {
					scope.$eval(attrs.ngOnEnter);
				});
				event.preventDefault();
			}
		});
	};

	return {
		link:linkFn
	};
});
