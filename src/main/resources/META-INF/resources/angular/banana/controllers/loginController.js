iBookmarks.app.LoginCtrl = ['$scope', '$http', '$rootScope', '$window',  'backend', 'mainService',
	function($scope, $http, $rootScope, $window, backend, mainService) {

		$scope.sessionToken = iBookmarks.sessionToken; // TODO instead of additional token, just use xsrfHeaderName and xsrfCookieName

		// authenticatoin info
		$scope.signedIn = false;
		$scope.authnInfo = {};

		$scope.proceedLogin = function () {
			console.log("Client login successful");
			console.log($scope.authnInfo);
			var request = gapi.client.plus.people.get({'userId': 'me'});
			request.execute(function (profile) {
				// profile fields {error, displayName, image.url, cover, coverPhoto, cover.coverPhoto.url, aboutMe, tagline}
				$scope.$apply(function () {
					$scope.signedIn = true;
					$scope.authnInfo.name = profile.displayName;
					$scope.authnInfo.userid = profile.id;
					console.log("Profile loaded. User id: "+profile.id); // ex. 102477976455620241458
					// connect server. server will upgrade the code into access token
					backend.authenticate(profile.id, $scope.authnInfo.code, $scope.sessionToken)
						.then(function(){
							$rootScope.$broadcast('successSignIn', []);
						});
				});
			});
		};

		$scope.logOut = function () {
			// this one should be called from server, however its still possible to call from browser but result
			//   is unknown (since google returns non-jsonp-compatible result)
			// see also http://stackoverflow.com/questions/14723383/google-logout-using-api-javascript-jquery
			console.log("Logging out user");
			console.log($scope.authnInfo);

			// TODO we want to disconnect server anyway, to issue a new sessionToken for example
			$http({method: 'jsonp', url: 'https://accounts.google.com/o/oauth2/revoke?token=' + $scope.authnInfo['access_token']})
				.success(function (data, status, headers, config) {
					//$scope.signedIn = false;
					//$scope.authResult = {};
					$window.location.reload(); // reload since we don't know the result.
				})
				.error(function (data, status, headers, config) {
					console.log("Error, status " + status, " data " + data);
					$window.location.reload(); // reload since we don't know the result.
				});

		};

		$scope.onSignInCallback = function (authResult) {
			if (authResult['access_token']) {
				$scope.authnInfo = authResult; // The user is signed in
				mainService.authnInfo = authResult;
				gapi.client.load('plus', 'v1', $scope.proceedLogin);
			} else if (authResult['error']) {
				$scope.$apply(function () {
					$scope.signedIn = false;
				});
				// There was an error, which means the user is not signed in.
				console.log('There was an error: ' + authResult['error']);
			}

			console.log("Callback: " + authResult['access_token']);
		};

		onSignInCallback = $scope.onSignInCallback;  // a hack for sign in button
	}];

