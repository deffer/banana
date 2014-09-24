iBookmarks.app.factory('alertsService', function ($timeout) {
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

		/**
		 * This will be auto dismissed after 4 seconds
		 * @param message
		 */
		addNotice: function(message){
			var alert = {message: message, type: 'success'};
			service.addAlert(alert, true);
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
		addAlert: function(alert, autodismiss){
			service.alerts.push(alert);
			_.each(service.listeners, function(listener){
				listener(alert);
			});
			if (autodismiss){
			   $timeout(function(){
				   // TODO fade-out instead of just dismiss
					var idx = service.alerts.indexOf(alert);
				   service.dismiss(idx);
			   }, 4000);
			}
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