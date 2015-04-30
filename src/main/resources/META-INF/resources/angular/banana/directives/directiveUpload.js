iBookmarks.app.factory('uploadManager', function ($rootScope, $q) {
	var _files = [];
	return {
		add: function (file) {
			_files.push(file);
			$rootScope.$broadcast('fileAdded', file.files[0].name);
		},
		clear: function () {
			_files = [];
		},
		fileCount: function(){
			return _files.length;
		},
		files: function () {
			var fileNames = [];
			$.each(_files, function (index, file) {
				fileNames.push(file.files[0].name);
			});
			return fileNames;
		},
		upload: function () {
			var promise;
			$.each(_files, function (index, file) {
				var defer = $q.defer();
                promise = defer.promise;
				file.submit().error(function(e){
					defer.reject(e);
				}).success(function(e){
					defer.resolve({});
				});
			});
			this.clear();
			return promise; // its one file. always.
		},
		setProgress: function (percentage) {
			$rootScope.$broadcast('uploadProgress', percentage);
		}
	};
});

iBookmarks.app.directive('upload', ['uploadManager', function factory(uploadManager) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			$(element).fileupload({
				dataType: 'text',
				add: function (e, data) {
					console.log("attempt to add file for upload");
					uploadManager.add(data);
				},
				progressall: function (e, data) {
					var progress = parseInt(data.loaded / data.total * 100, 10);
					uploadManager.setProgress(progress);
				},
				done: function (e, data) {
					uploadManager.setProgress(110);
				}
			});
		}
	};
}]);
