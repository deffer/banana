myApp.directive('utilsBlock', ['backend', function (backend) {
	return {
		restrict: 'A',
		scope: {
			functionA : "="
		},

		// own scope: select2Options, inputUrl, inputTitle, inputLabels
		link: function (scope, element, attrs) {
			scope.timeMillis = "";
			scope.timeString = "";
			scope.base64input = "";
			scope.base64output = "";
			scope.hashOutput = "";
			scope.hashInput = "";
			scope.regexInput = "";
			scope.regexTestInput = "";
			scope.regexMatches = [];
			scope.regexFullMatch = ""; // values yes or no

			scope.getTimeString = function(){
				backend.callUtils("timeMillis", scope.timeMillis).then(function(results){
					console.log(results);
					if (!_.isUndefined(results) && !_.isUndefined(results.output)){
						scope.timeString = results.output;
						if (scope.timeMillis=="")
							scope.timeMillis = results.input;
					}
				});
			};

			scope.regexTest = function(){
				backend.callUtils("regexTest", scope.regexTestInput, scope.regexInput).then(function(results){
					console.log(results);
					if (_.isUndefined(results) || results.error){
						scope.regexMatches = [];
						scope.regexFullMatch = "";
					}else{
						scope.regexFullMatch = results.output;
					}
				});
			};

			scope.encode64 = function(){
				scope.base64output = window.btoa(unescape(encodeURIComponent(scope.base64input)));
			};

			scope.decode64 = function(){
				scope.base64output = window.atob(escape(scope.base64input));
			};

			scope.getHash = function(func){
				scope.hashOutput = CryptoJS[func](scope.inputHash).toString(CryptoJS.enc.Hex);
			};
		}
	};
}]);