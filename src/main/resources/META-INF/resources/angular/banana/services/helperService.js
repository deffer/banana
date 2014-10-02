iBookmarks.app.factory('helperService', function(){
	var service = {
		isNotDefined : function(obj){
			return _.isUndefined(obj) || _.isNull(obj);
		},

		isEmpty: function(obj){
			return service.isNotDefined(obj) || _.isEmpty(obj) || obj == 'null'
		},

		guessUrlTitle: function(url){
			var parts = _.filter( _.words(url, '/'), function(item){return !_.isEmpty(item)});

			var slug = _.last(parts);
			var domain = _.first(parts);
			if  (_.startsWith(domain, 'http')){
				if (parts.length>1){
					domain = parts[1];
				}else{
					return null;
				}
			}
			if (domain == slug)
				return null;

			if (slug.indexOf('?')>0)
				slug = _.strLeft(slug, '?');

			if (slug.indexOf('.htm')>0){
				slug = _.strLeft(slug, '.htm')
			}else if (slug.indexOf('.php')>0){
				slug = _.strLeft(slug, '.php')
			}

			if (_.str.include(slug, '.'))
			    return null;

			if (service._looksLikeASlug(slug, domain))
				return  _.humanize(slug);
			else
				return null;
		},

		_looksLikeASlug: function(slug, domain){
			if (slug.indexOf('-') > -1 || slug.indexOf('_') > -1){
				return true;
			}

			// inspect domain.
			var parts =  _.words(domain, '.');
			if (_.contains(parts, 'wiki') || _.contains(parts, 'wikipedia'))
				return true;

			return false;
		}
	};
	return service;
});
