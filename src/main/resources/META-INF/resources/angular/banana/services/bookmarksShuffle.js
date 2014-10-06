iBookmarks.app.factory('bookmarksShuffle', function (){
	var bookmarkStore = {filterOn:false};
	var service = {
		folderUnlabelled : {id: 'App123Unlabelled', originalName: 'Unlabelled', count: 0},
		folderAll : {id: 'App123AllLabels', originalName: 'All', count: 0},

		convertFromServer: function(bookmarks) {
			bookmarkStore.filterOn = false;
			bookmarkStore.filter = null;

			bookmarkStore.all = bookmarks;
			service.filterByPartial([]);
			service.updateUrlMap(); // create urls map for faster access
			return bookmarkStore;
		},

		/**
		 * Expects bookmarkStore.all to contain all bookmarks. Each bookmark is a map:
		 *   {id: .., url: .., title: .., labels: []}
		 *
		 * Labels and folders mean the same. (Bookmark has labels => bookmark exist in those folders).
		 *
		 * Will populate next fields:
		 *   -foldersList = [{id: label, originalName: label, count: 0}, {}, ...]
		 *          where count is number of bookmarks matching filter in this folder.
		 *          This is used when bookmark is modified to suggest available labels to user
		 *   -displayFolders = same as foldersList + All + Unlabelled.
		 *          This is a content of Folders drop down.
		 *   -folders = MAP: label -> [ {}, {}, {}, ... ] where {} is a bookmark. only those matching filter.
		 *   -urlsMap = MAP: url -> [{}, ...] where {} is a bookmark.
		 * @param filter array of partials. If any of the partials matches any part of url or title, its a match!
		 *   Empty value means no filter, just show all bookmarks.
		 */
		filterByPartial: function(filter){

			bookmarkStore.foldersList = [];
			bookmarkStore.folders = {};
			 var displayFolders = [];

			_.each(_.unique(_.flatten(_.pluck(bookmarkStore.all, "labels"), true)), function(label){
				bookmarkStore.foldersList.push( {id: label, originalName: label, count: 0} );
				bookmarkStore.folders[label] = [];
			});

			bookmarkStore.folders[service.folderUnlabelled.id] = [];
			bookmarkStore.folders[service.folderAll.id] = [];

			// group bookmarks into folders (labels)
			_.each(bookmarkStore.all, function(b){
				if (service.matchesFilter(b, filter)) {
					var labels = service._getLogicalLabels(b);
					_.each(labels, function(label){
						bookmarkStore.folders[label].push(b);
					});
					// also add to all
					bookmarkStore.folders[service.folderAll.id].push(b);
				}
			});

			displayFolders.push.apply(displayFolders, bookmarkStore.foldersList);
			displayFolders.push(service.folderAll);
			if (bookmarkStore.folders[service.folderUnlabelled.id].length>0)
				displayFolders.push(service.folderUnlabelled);

			// Sort folder. All should be first, Unlabelled - last
			bookmarkStore.displayFolders = displayFolders.sort(function(a,b){
				if (a.id == service.folderAll.id || b.id == service.folderUnlabelled)
					return -1;
				else  if (a.id == service.folderUnlabelled.id || b.id==service.folderAll.id)
					return 1;
				else
					return a.originalName.localeCompare(b.originalName)
			});


			// update labels with total count in each folder
			_.each(bookmarkStore.displayFolders, function (folderEntry) {
				var label = folderEntry.id;
				var items = bookmarkStore.folders[label];

				folderEntry.count = items.length;
				folderEntry.name = folderEntry.originalName+" ("+folderEntry.count+")"; // <--- label display name
			});

            return bookmarkStore;
		},

		// create urls map for faster access
		updateUrlMap : function(){
			bookmarkStore.urlsMap = {};
			//_.each(_.pluck(bookmarkStore.all, 'url'), function(url){bookmarkStore.urlsMap[url] = []});
			_.each(bookmarkStore.all, function (bookmark) {
				service._addToUrlMap(bookmark);
				/*var list = bookmarkStore.urlsMap[bookmark.url];
				if (!_.find(list, function(item) {return item.id == bookmark.id})){ // although we dont expect duplicate ids from server
					list.push(bookmark);
				} */
			});
			return bookmarkStore;
		},

		_addToUrlMap: function(bookmark){
			var url = _.rtrim(bookmark.url, '/');
			var urlMap = bookmarkStore.urlsMap[url];
			if (_.isUndefined(urlMap)){
				bookmarkStore.urlsMap[url] = [bookmark];
			}else{
				if (!_.find(urlMap, function(item){return item.id == bookmark.id}))
					urlMap.push(bookmark);
			}
		},
		_removeFromUrlMap: function(bookmark){
			var url = _.rtrim(bookmark.url, '/');
			var urlMap = bookmarkStore.urlsMap[url];
			if (urlMap)
				service.removeFromListById(urlMap, bookmark.id);
		},

		checkBookmarkExists : function(inputUrl, exceptThisBookmarkId){
			if (!inputUrl) return;
			if (!bookmarkStore.urlsMap) return;

			var url = _.rtrim(inputUrl, '/');
			var urlsList = bookmarkStore.urlsMap[url];

			if (urlsList){ // get first bookmarks that match entered url
				var b = _.find(urlsList, function (item){return (!exceptThisBookmarkId) || exceptThisBookmarkId != item.id});
				if (b){
					var result = {id: b.id, title: b.title, url:inputUrl, labels: b.labels,
						listFolders: _(b.labels.join(',')).prune(15, '..'),
						shortTitle: b.title.substring(0, _.min(b.title.length, 25))
					};
					console.log("Suggesting...");
					console.log(result);
					return result;
				}
			}
			return null;
		},

		getFolderById: function(id){
			return _.find(bookmarkStore.displayFolders, function(it){return it.id == id});
		},
		getBookmark: function(id){
			return _.find(bookmarkStore.all, function (b) { return b.id == id;});
		},

		clearFilter : function(){
			if (bookmarkStore.filterOn)
				service.filterByPartial([]);
			bookmarkStore.filterOn = false;
			bookmarkStore.filter = undefined;
		},

		matchesFilter : function(bookmark, filter){
			var matches = true;
			_.each(filter, function(part){
				if (matches && bookmark.title.indexOf(part)<0 && bookmark.url.indexOf(part)<0)
					matches =  false;
			});
			return matches;
		},

		/**
		 * If its edit, find and change existing entry. Also will need to change folders (if labels changed)
		 *    and url map (if url changed). Don't forget to take care of Unlabelled folder too.
		 *
		 * Returns true if bookmark matches current filter
		 * @param data
		 * @param existing
		 */
		updateAfterBookmarkChanged: function(data, existing){
			var b = existing ? existing : data;
			var id = b.id;

			var previousLabels = service._getLogicalLabels(existing);
			var newLabels = service._getLogicalLabels(data);

			var urlChanged = (existing && existing.url != data.url);

			var matchesFilter = true;
			if (bookmarkStore.filterOn){
				matchesFilter = service.matchesFilter(b, bookmarkStore.filter);
			}

			// ensure folders are initialized with empty array (also Unlabelled)
			_.each(newLabels, function(label){
				if (_.isUndefined(bookmarkStore.folders[label])){
					bookmarkStore.folders[label] = [];
				}
			});

			// remove from previous url map
			if (urlChanged){
				service._removeFromUrlMap(existing);
			}
			// add to new url map
			if (!existing || urlChanged){
				service._addToUrlMap(data);
			}

			/*if (_.isUndefined(bookmarkStore.urlsMap[data.url])){
				bookmarkStore.urlsMap[data.url] = [b];
			}else{
				if (!existing || urlChanged)
					bookmarkStore.urlsMap[data.url].push(b);
			}*/

			// update folders
			if (existing && _.difference(existing.labels, data.labels)){
				// remove from folders
				_.each(previousLabels, function(label){
					if (!_.contains(newLabels, label)){
						console.log("Losing label "+label+". Previous content is:");
						console.log(bookmarkStore.folders[label]);
						service.removeFromListById(bookmarkStore.folders[label], id);
						service._updateFoldersCount(label); // decrease count in foldersList entry
					}
				});
			}
			_.each(newLabels, function(label){
				if (!_.contains(previousLabels, label)){
					if (matchesFilter){
						console.log("Adding folder "+label);
						bookmarkStore.folders[label].push(b);
						service._updateFoldersCount(label); // increase count in foldersList entry
					}else{
						console.log("Skip adding folder because entry doesn't match filter");
					}
				}
			});


			if (existing){
				// update bookmark itself
				b.title = data.title;
				b.url = data.url;
				b.labels = data.labels;
			}else{
				// add to all
				bookmarkStore.all.push(b);
				bookmarkStore.folders[service.folderAll.id].push(b);
				service._updateFoldersCount(service.folderAll.id);
			}

			return matchesFilter;
		},

		updateAfterBookmarkDeleted: function(b){
			var id = b.id;
			var folders = service._getLogicalLabels(b);

			console.log("Removing labels");
			console.log(folders);
			_.each(folders, function(label){
				service.removeFromListById(bookmarkStore.folders[label], id);
				service._updateFoldersCount(label);
			});

			service.removeFromListById(bookmarkStore.folders[service.folderAll.id], id);
			service._updateFoldersCount(service.folderAll.id);

			//console.log("Removing from urls list for '"+ b.url+" id="+id);
			//service.removeFromListById(bookmarkStore.urlsMap[b.url], id);
			service._removeFromUrlMap(b);
			service.removeFromListById(bookmarkStore.all, id);
		},

		// adds Unlabelled if necessary
		_getLogicalLabels: function(bookmark){
			if (_.isUndefined(bookmark) || _.isNull(bookmark))
				return [];

			if (_.isEmpty(bookmark.labels))
				return [service.folderUnlabelled.id];
			else
				return bookmark.labels;
		},

		// takes care of removing folder (from foldersList and displayFolder) if its empty
		// or adding if it didn't exist. based on the information in 'folders' map
		_updateFoldersCount: function(label) {
			var cnt = bookmarkStore.folders[label].length;
			var folderInfo = service.getFolderById(label);
			if (!folderInfo){
				if (cnt == 0){
					return;
				}else{
					var newFolder = {id: label, originalName: label, name: label+" (1)", count: 1};
					bookmarkStore.foldersList.push(newFolder );
					bookmarkStore.displayFolders.push(newFolder);
					return;
				}
			}

			if (cnt == 0){
				console.log("Last item was removed from folder "+label+" - removing the reference");
				service.removeFromListById(bookmarkStore.foldersList, label);
				service.removeFromListById(bookmarkStore.displayFolders, label);
			}else{
				folderInfo.count = cnt;
				folderInfo.name = folderInfo.originalName+" ("+cnt+")";
			}
		},

		removeFromListById: function(list, id){
			var item = _.findWhere(list, {id: id});
			if (item){
				var idx = list.indexOf(item);  //  \
				list.splice(idx, 1);           // _ there must be a better way
			}else{
				console.log("Id "+id+" not found");
			}
		},

		useExampleStore : function(){
			bookmarkStore.all = [
				{id: 1, url: "https://groovyconsole.appspot.com/", title: "Groovy web console", labels: ["Development"]},
				{id: 2, url: "http://www.techempower.com/blog/2013/03/26/everything-about-java-8/", title: "Everything about java 8", labels: ["Development"]},
				{id: 3, url: "https://people.gnome.org/~federico/news-2008-11.html#pushing-and-pulling-with-git-1", title: "Pushing and pulling with git", labels: ["Development"]},
				{id: 4, url: "http://justinhileman.info/article/git-pretty/", title: "How to git pretty", labels: ["Development"]},
				{id: 5, url: "http://www.regexplanet.com/advanced/java/index.html", title: "Regex test tool", labels: ["Development"]},
				{id: 8, url: "http://paulherron.com/blog/vim_cheatsheet/", title: "Vim cheat sheet", labels: ["Development", "Unix"]},
				{id: 9, url: "https://gist.github.com/nifl/1178878", title: "The Zen of vi", labels: ["Development", "Unix"]},
				{id: 11, url: "http://clippy.in/b/YJLM9W", title: "Favorite Linux Commands", labels: ["Unix"]},
				{id: 12, url: "http://www.sans.org/security-resources/sec560/netcat_cheat_sheet_v1.pdf", title: "Netcat cheat sheet", labels: ["Unix"]}
			];

			service.filterByPartial([]);
			service.updateUrlMap();
			bookmarkStore.example = true;
			return bookmarkStore;
		}
	};
	return service;
});
