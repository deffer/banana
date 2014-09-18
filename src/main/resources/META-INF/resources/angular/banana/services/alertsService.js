iBookmarks.app.factory('alertsService', function () {
	var service = {
		listeners: [],
		alerts: [],

		/*
		 --------------------------------------------------------------
		   Bunch of helper methods
		 --------------------------------------------------------------
		 */
		addListener: function(listener){
			service.listeners.push(listener);
		},
		addWarning: function(message, details){
			service._addClosable(message, details, 'warning');
		},
		addSuccess: function(message, details){
			service._addClosable(message, details, 'success');
		},
		addInfo: function(message, details){
			service._addClosable(message, details, 'info');
		},
		addError: function(message, details){
			service._addClosable(message, details, 'error');
		},
		addFatal: function(message, details){
			var alert = {message: message, type: 'error'};
			if (details)
				alert.details = details;
			service.addAlert(alert);
		},

		_addClosable: function(message, details, type){
			var result = {message: message, type: type, closeable: true};
			if (details){
				result.details = details;
			}
			service.addAlert(result);
		},

		/*
		 --------------------------------------------------------------
			Methods here
		 --------------------------------------------------------------
		 */
		addAlert: function(alert){
			service.alerts.push(alert);
			_.each(service.listeners, function(listener){
				 listener(alert);
			});
		},

		dismiss: function(idx) {
			service.alerts.splice(idx, 1);
		},

		clearAll: function() {
			service.alerts.length = 0;
		}
	};
	return service;
});