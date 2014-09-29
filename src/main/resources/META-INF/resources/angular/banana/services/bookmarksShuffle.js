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
					var labels;
					if (b.labels.length == 0){
						labels = [service.folderUnlabelled.id]
					}else{
						labels = b.labels;
					}
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

			console.log(bookmarkStore.displayFolders);

            return bookmarkStore;
		},

		// create urls map for faster access
		updateUrlMap : function(){
			bookmarkStore.urlsMap = {};
			_.each(_.pluck(bookmarkStore.all, 'url'), function(url){bookmarkStore.urlsMap[url] = []});
			_.each(bookmarkStore.all, function (bookmark) {
				var list = bookmarkStore.urlsMap[bookmark.url];
				if (!_.find(list, function(item) {return item.id == bookmark.id})){ // although we dont expect duplicate ids from server
					list.push(bookmark);
				}
			});
			return bookmarkStore;
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

		checkBookmarkExists : function(inputUrl, exceptThisBookmarkId){
			var urlsMap = bookmarkStore.urlsMap;
			if (inputUrl && urlsMap[inputUrl]){ // get first bookmarks that match entered url
				var b = _.find(urlsMap[inputUrl], function (item){return (!exceptThisBookmarkId) || exceptThisBookmarkId == item.id});
				console.log("Bookmarks with this url exists...");
				var result = {id: b.id, title: b.title, url:inputUrl,listFolders: b.labels,
					shortTitle: b.title.substring(0, _.min(b.title.length, 15))
				};
				console.log("Suggesting...");
				console.log(result);
				return result;
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

		/**
		 * If its edit, find and change existing entry. Also will need to change folders (if labels changed)
		 *    and url map (if url changed). Don't forget to take care of Unlabelled folder too.
		 *
		 *
		 * Returns true if bookmark matches current filter
		 * @param data
		 * @param existing
		 */
		updateAfterBookmarkChanged: function(data, existing){
			var b = existing ? existing : data;
			var id = b.id;

			var urlChanged = (existing && existing.url != data.url);

			var matchesFilter = true;
			if (bookmarkStore.filterOn){
				matchesFilter = service.matchesFilter(b, bookmarkStore.filter);
			}

			// ensure folders are initialized with empty array
			_.each(data.labels, function(label){
				if (_.isUndefined(bookmarkStore.folders[label])){
					bookmarkStore.folders[label] = [];
				}
			});

			// update url maps if necessary
			if (urlChanged){
				service.removeFromListById(bookmarkStore.urlsMap[existing.url], id);
			}
			if (_.isUndefined(bookmarkStore.urlsMap[data.url])){
				bookmarkStore.urlsMap[data.url] = [b];
			}else{
				if (!existing || urlChanged)
					bookmarkStore.urlsMap[data.url].push(b);
			}

			// update folders
			if (existing && _.difference(existing.labels, data.labels)){
				// remove from folders
				_.each(existing.labels, function(label){
					if (!_.contains(data.labels, label)){
						console.log(bookmarkStore.folders[label]);
						service.removeFromListById(bookmarkStore.folders[label], id);
						service._updateFoldersCount(label); // decrease foldersList count
					}
				});
			}
			_.each(data.labels, function(label){
				if (!existing || (existing && !_.contains(existing.labels, label))){
					if (matchesFilter){
						console.log("Adding folder "+label);
						bookmarkStore.folders[label].push(b);
						service._updateFoldersCount(label); // increase foldersList count
					}else{
						console.log("Skip adding folder because entry doesn't match filter");
					}
				}
			});

			// TODO if data.labels empty and (folders changed or its new entry), need to add to unlabelled
			// TODO if existing.labels empty and folders changed, remove from unlabelled.
			// TODO update ALL if necessary

			// update bookmark itself
			if (existing){
				b.title = data.title;
				b.url = data.url;
				b.labels = data.labels;
			}else{
				bookmarkStore.all.push(b);
			}

			return matchesFilter;
		},

		updateAfterBookmarkDeleted: function(b){
			var id = b.id;
			if (b.labels && b.labels.length>0){
				_.each(b.labels, function(label){
					service.removeFromListById(bookmarkStore.folders[label], id);
					service._updateFoldersCount(label);
				});
			}else{
				service.removeFromListById(bookmarkStore.folders[service.folderUnlabelled.id], id);
				service._updateFoldersCount(service.folderUnlabelled.id);
			}
			service.removeFromListById(bookmarkStore.folders[service.folderAll.id], id);
			service._updateFoldersCount(service.folderAll.id);

			service.removeFromListById(bookmarkStore.urlsMap[b.url], id);
			service.removeFromListById(bookmarkStore.all, id);
		},


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

			folderInfo.count = cnt;
			folderInfo.name = folderInfo.originalName+" ("+cnt+")";
			if (cnt == 0){
				console.log("Last item was removed from folder "+label+" - removing the reference");
				service.removeFromListById(bookmarkStore.foldersList, label);
				service.removeFromListById(bookmarkStore.displayFolders, label);
			}
		},

		removeFromListById: function(list, id){
			var item = _.where(list, {id: id});
			if (item){
				var idx = list.indexOf(item);  //  \
				list.splice(idx, 1);           // _ there must be a better way
			}else{
				console.log("Id "+id+" not found");
			}
		},

		useExampleStore : function(){
			bookmarkStore.all = [
				{url:"http://stackoverflow.com/questions/101268/hidden-features-of-python", title: "Hidden features of python", id: 1, labels: ["Development"]},
				{url: "https://people.gnome.org/~federico/news-2008-11.html#pushing-and-pulling-with-git-1", title: "Pushing and pulling with git", id: 2, labels: ["Development"]},
				{url: "http://justinhileman.info/article/git-pretty/", title: "How to git pretty", id: 3, labels: ["Development"]},
				{url: "http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol", title: "Secure Remote Password protocol", id: 4, labels: ["Development"]},
				{url: "http://www.sans.org/security-resources/sec560/netcat_cheat_sheet_v1.pdf", title: "Netcat cheat sheet", id: 5, labels: ["Development", "Unix"]},
				{url: "http://nealford.com/memeagora/2013/01/22/why_everyone_eventually_hates_maven.html", title: "Why everyone eventually hates maven", id: 6, labels: ["Development"]},
				{url: "http://clippy.in/b/YJLM9W", title: "Favorite Linux Commands", id: 11, labels: ["Unix"]},
				{url: "https://gist.github.com/nifl/1178878", title: "The 'Zen' of vi", id: 12, labels: ["Unix"]}];

			service.filterByPartial([]);
			service.updateUrlMap();
			bookmarkStore.example = true;
			return bookmarkStore;
		}
	};
	return service;
});
