iBookmarks.app.factory('alerts', function () {
	var service = {
		listeners: [],
		addListener: function(listener){
			service.listeners.push(listener);
		},
		addAlert: function(alert){
			_.each(service.listeners, function(listener){
				 listener(alert);
			});
		}
	};
	return service;
});