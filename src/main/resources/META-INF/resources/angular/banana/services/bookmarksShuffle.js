iBookmarks.app.factory('bookmarksShuffle', function (){
	var service = {
		folderUnlabelled : {id: 'App123Unlabelled', originalName: 'Unlabelled', count: 0},
		folderAll : {id: 'App123AllLabels', originalName: 'All', count: 0},

		convertFromServer: function(bookmarks, bookmarkStore) {
			bookmarkStore.filterOn = false;

			bookmarkStore.all = bookmarks;
			service.filterByPartial(bookmarkStore, []);
			service.updateUrlMap(bookmarkStore); // create urls map for faster access
			return bookmarkStore;
		},

        /**
         * Expects bookmarkStore.all to contain all bookmarks. Each bookmark is a map:
         *   {id: .., url: .., title: .., labels: []}
         * Will populate next fields:
         *   -foldersList = [{id: label, originalName: label, count: 0}, {}, ...]
         *   -folders = map: label -> [ {}, {}, {}, ... ] where {} is a bookmark. only those matching filter.
         *   -displayFolders = same as foldersList + All + Unlabelled
         *   -unlabelled = [ {}, {}, {}, ... ] where {} is a bookmark.
         *   -urlsMap = map: url -> [ids...]
         * @param bookmarkStore
         * @param filter array of partials. If any of the partials matches any part of url or title, its a match!
         */
		filterByPartial: function(bookmarkStore, filter){

			bookmarkStore.foldersList = [];
			bookmarkStore.folders = {};
	        bookmarkStore.displayFolders = [];

			_.each(_.unique(_.flatten(_.pluck(bookmarkStore.all, "labels"), true)), function(label){
				bookmarkStore.foldersList.push( {id: label, originalName: label, count: 0} );
				bookmarkStore.folders[label] = [];
			});

			bookmarkStore.folders[service.folderUnlabelled.id] = [];
			bookmarkStore.folders[service.folderAll.id] = [];

			// group bookmarks into folders (labels)
			_.each(bookmarkStore.all, function(b){
				if (service.matchesFilter(b, filter)) {
					var labels;
					if (b.labels.length == 0){
						labels = [service.folderUnlabelled.id]
					}else{
						labels = b.labels;
					}
					_.each(labels, function(label){
						//bookmarkStore.bookmarks[label].push({id: b.id, url: b.url, title: b.title, labels: b.labels, label: label});
						bookmarkStore.folders[label].push(_.extend({}, b, {label: label}));
					});
					// also add to all
					//bookmarkStore.bookmarks[service.folderAll.id].push({id: b.id, url: b.url, title: b.title, labels: b.labels});
					bookmarkStore.folders[service.folderAll.id].push(_.extend({}, b));
				}
			});

			bookmarkStore.displayFolders.push.apply(bookmarkStore.displayFolders, bookmarkStore.foldersList);
			bookmarkStore.displayFolders.push(service.folderAll);
			if (bookmarkStore.folders[service.folderUnlabelled.id].length>0)
				bookmarkStore.displayFolders.push(service.folderUnlabelled);

	        // TODO All should be first, Unlabelled - last
	        bookmarkStore.displayFolders.sort(function(a,b){return a.originalName.localeCompare(b.originalName)});
			bookmarkStore.unlabelled = bookmarkStore.folders[service.folderUnlabelled.id];


			console.log(bookmarkStore.displayFolders);

			// update labels with total count in each folder
			_.each(bookmarkStore.displayFolders, function (folderEntry) {
				var label = folderEntry.id;
				var items = bookmarkStore.folders[label];

				folderEntry.count = items.length;
				folderEntry.name = folderEntry.originalName+" ("+folderEntry.count+")"; // <--- label display name
				//console.log("Found " + items.length + " in " + label);
			});

            return bookmarkStore;
		},

		// create urls map for faster access
		updateUrlMap : function(bookmarkStore){
			bookmarkStore.urlsMap = {};
			var urls = _.each(_.pluck(bookmarkStore.all, 'url'), function(url){bookmarkStore.urlsMap[url] = []});
			_.each(bookmarkStore.all, function (bookmark) {
				var idsList = bookmarkStore.urlsMap[bookmark.url];
				if (!_.contains(idsList, bookmark.id)){
					idsList.push(bookmark.id);
				}
			});
			return bookmarkStore;
		},

		clearFilter : function(bookmarkStore){
			if (bookmarkStore.filterOn)
				service.filterByPartial(bookmarkStore, []);
			bookmarkStore.filterOn = false;
		},

		checkBookmarkExists : function(bookmarkStore, inputUrl){
			var urlsMap = bookmarkStore.urlsMap;
			if (inputUrl && urlsMap[inputUrl]){
				var bookmarkId = urlsMap[inputUrl][0]; // get first bookmarks that match entered url
				var bookmarks = _.find(bookmarkStore.all, function(b){return b.id == bookmarkId});
				if (bookmarks){
					console.log(bookmarks);
					var b = bookmarks; // bookmarks[0];
					var result = {id: bookmarkId, title: b.title,
						url:inputUrl,
						shortTitle: b.title.substring(0, _.min(b.title.length, 15)),
						listFolders: b.labels
					};
					console.log("Suggesting...");
					console.log(result);
					return result;  //  <-------------------- RETURN
				}else{
					console.log("OMG! Map url to bookmarkIds is corrupted: cant find bookmark "+bookmarkId);
				}
			}
			return null;
		},

		matchesFilter : function(bookmark, filter){
			var matches = true;
			_.each(filter, function(part){
				if (matches && bookmark.title.indexOf(part)<0 && bookmark.url.indexOf(part)<0)
					matches =  false;
			});
			return matches;
		},

		updateAfterBookmarkAdded: function(b, bookmarkStore){

		},

		getExampleStore : function(){
				var example = [
				{url:"http://stackoverflow.com/questions/101268/hidden-features-of-python", title: "Hidden features of python", id: 1, labels: ["Development"]},
				{url: "https://people.gnome.org/~federico/news-2008-11.html#pushing-and-pulling-with-git-1", title: "Pushing and pulling with git", id: 2, labels: ["Development"]},
				{url: "http://justinhileman.info/article/git-pretty/", title: "How to git pretty", id: 3, labels: ["Development"]},
				{url: "http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol", title: "Secure Remote Password protocol", id: 4, labels: ["Development"]},
				{url: "http://www.sans.org/security-resources/sec560/netcat_cheat_sheet_v1.pdf", title: "Netcat cheat sheet", id: 5, labels: ["Development", "Unix"]},
				{url: "http://nealford.com/memeagora/2013/01/22/why_everyone_eventually_hates_maven.html", title: "Why everyone eventually hates maven", id: 6, labels: ["Development"]},
				{url: "http://clippy.in/b/YJLM9W", title: "Favorite Linux Commands", id: 11, labels: ["Unix"]},
				{url: "https://gist.github.com/nifl/1178878", title: "The 'Zen' of vi", id: 12, labels: ["Unix"]}];
			var result = {all:example, filterOn:false};
			service.filterByPartial(result, []);
			service.updateUrlMap(result);
			return result;
		}
	};
	return service;
});
