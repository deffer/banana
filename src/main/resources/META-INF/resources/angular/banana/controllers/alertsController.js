iBookmarks.app.AlertsCtrl = ['$scope', '$rootScope', '$window', 'alertsService', function($scope, $rootScope, $window, alertsService) {
	$scope.alerts = alertsService.alerts;

	// Mock up some alert to see that they are actually working
	//alertsService.addWarning("Something went wrong");
	//alertsService.addFatal("Server error. Unable to continue.");

	$scope.closeAlertCallback = function(index){
		console.log("Closing alert under index "+index);
		alertsService.dismiss(index);
	};
}];
