iBookmarks.app.directive('bmAlert', function() {
	var result = {
		restrict: 'E',
		templateUrl: '/alert.html',
		scope: {
			alert: '=alertObject',
			onAlertClose: '&'
		},
		link: function(scope){
			scope.closeClick = function(){
				if (scope.onAlertClose)
					scope.onAlertClose();
			}
		}
	};
	return result;
});