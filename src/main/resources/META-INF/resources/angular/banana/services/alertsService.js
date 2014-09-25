iBookmarks.app.factory('alertsService', function ($timeout) {
	var service = {
		CODE_NO_BOOKMARKS:  0,
		CODE_NOT_LOGGED_IN: 1,
		CODE_SERVER_UNAVAILABLE: 2,

		listeners: [],
		alerts: [],

		/*
		 --------------------------------------------------------------
		   Bunch of helper methods
		 --------------------------------------------------------------
		 */
		addListener: function(listener){
			return service.listeners.push(listener);
		},
		addWarning: function(message, details){
			return service._addClosable(message, details, 'warning');
		},
		addSuccess: function(message, details){
			return service._addClosable(message, details, 'success');
		},
		addInfo: function(message, details){
			return service._addClosable(message, details, 'info');
		},
		addError: function(message, details){
			return service._addClosable(message, details, 'error');
		},
		addFatal: function(message, details){
			var alert = {message: message, type: 'error'};
			if (details)
				alert.details = details;
			return service.addAlert(alert);
		},

		/**
		 * This will be auto dismissed after 4 seconds
		 * @param message
		 */
		addNotice: function(message){
			var alert = {message: message, type: 'success'};
			return service.addAlert(alert, true);
		},

		_addClosable: function(message, details, type){
			var result = {message: message, type: type, closeable: true};
			if (details){
				result.details = details;
			}
			return service.addAlert(result);
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
			return alert;
		},

		dismiss: function(idx) {
			service.alerts.splice(idx, 1);
		},

		dismissAllWithCode: function(code){
			var alerts2delete = _.where(service.alerts, {code: code});
			_.each(alerts2delete, function(alert){
				var idx = service.alerts.indexOf(alert);
				service.dismiss(idx);
			});
		},

		clearAll: function() {
			service.alerts.length = 0;
		}
	};
	return service;
});