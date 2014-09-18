iBookmarks.app.factory('alertsService', function () {
	var service = {
		listeners: [],
		alerts: [],
		addListener: function(listener){
			service.listeners.push(listener);
		},
		addWarning: function(message){
			service.addAlert({message: message, type: 'warning', closable: true});
		},
		addSuccess: function(message){
			service.addAlert({message: message, type: 'success', closable: true});
		},
		addInfo: function(message){
			service.addAlert({message: message, type: 'info', closable: true});
		},
		addError: function(message){
			service.addAlert({message: message, type: 'error', closable: true});
		},
		addFatal: function(message){
			service.addAlert({message: message, type: 'error'});
		},
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