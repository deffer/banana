iBookmarks.app.UtilsCtrl = ['$scope', '$http', '$rootScope', '$window', 'backend',
	function($scope, $http, $rootScope, $window, backend) {

	$scope.timeMillis = "";
	$scope.timeString = "";
	$scope.base64input = "";
	$scope.base64output = "";
	$scope.hashOutput = "";
	$scope.hashInput = "";
	$scope.regexInput = "";
	$scope.regexTestInput = "";
	$scope.regexMatches = [];
	$scope.regexFullMatch = ""; // values yes or no

	$scope.getTimeString = function(){
	    console.log("Calling TimeString...");
		backend.callUtils("timeMillis", $scope.timeMillis).then(function(results){
			console.log(results);
			if (!_.isUndefined(results) && !_.isUndefined(results.output)){
				$scope.timeString = results.output;
				if ($scope.timeMillis=="")
					$scope.timeMillis = results.input;
			}
		});
	};

	$scope.regexTest = function(){
		backend.callUtils("regexTest", $scope.regexTestInput, $scope.regexInput).then(function(results){
			console.log(results);
			if (_.isUndefined(results) || results.error){
				$scope.regexMatches = [];
				$scope.regexFullMatch = "";
			}else{
				$scope.regexFullMatch = results.output;
				if (!_.isUndefined(results.outputs)){
					$scope.regexMatches=results.outputs;
				} else{
					$scope.regexMatches = [];
				}
			}
		});
	};

	$scope.encode64 = function(){
		$scope.base64output = window.btoa(unescape(encodeURIComponent($scope.base64input)));
	};

	$scope.decode64 = function(){
		scope.base64output = window.atob(escape($scope.base64input));
	};

	$scope.getHash = function(func){
		$scope.hashOutput = CryptoJS[func]($scope.inputHash).toString(CryptoJS.enc.Hex);
	};
}];
