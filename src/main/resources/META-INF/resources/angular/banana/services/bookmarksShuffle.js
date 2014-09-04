myApp.factory('bookmarksShuffle', function (){
	var service = {
		folderUnlabelled : {id: 'App123Unlabelled', originalName: 'Unlabelled', count: 0},
		folderAll : {id: 'App123AllLabels', originalName: 'All', count: 0},

		convertFromServer: function(bookmarks, bookmarkStore) {
			bookmarkStore.filterOn = false;

			bookmarkStore.all = bookmarks;
			service.filterByPartial(bookmarkStore, []);
			return bookmarkStore;
		},

        /**
         * Expect bookmarkStore.all to contain all bookmarks. Each bookmarks is a map:
         *   {}
         * Will populate next fields:
         *   -folders = [{id: label, originalName: label, count: 0}, {}, ...]
         *   -bookmarks = map: label -> [ {}, {}, {}, ... ] where {} is a bookmark
         *   -displayFolders = same as folder + All + Unlabelled
         *   -unlabelled
         *   -urlsMap
         * @param bookmarkStore
         * @param filter array of partials. If any of the partials matches any part of url or title, its a match!
         */
		filterByPartial: function(bookmarkStore, filter){

			bookmarkStore.folders = [];
			bookmarkStore.bookmarks = {};

			_.each(_.unique(_.flatten(_.pluck(bookmarkStore.all, "labels"), true)), function(label){
				bookmarkStore.folders.push( {id: label, originalName: label, count: 0} );
				bookmarkStore.bookmarks[label] = [];
			});

			bookmarkStore.bookmarks[service.folderUnlabelled.id] = [];
			bookmarkStore.bookmarks[service.folderAll.id] = [];

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
						bookmarkStore.bookmarks[label].push(_.extend({}, b, {label: label}));
					});
					// also add to all
					//bookmarkStore.bookmarks[service.folderAll.id].push({id: b.id, url: b.url, title: b.title, labels: b.labels});
					bookmarkStore.bookmarks[service.folderAll.id].push(_.extend({}, b));
				}
			});


			bookmarkStore.displayFolders = [];
			bookmarkStore.displayFolders.push.apply(bookmarkStore.displayFolders, bookmarkStore.folders);
			bookmarkStore.displayFolders.push(service.folderAll);
			if (bookmarkStore.bookmarks[service.folderUnlabelled.id].length>0)
				bookmarkStore.displayFolders.push(service.folderUnlabelled);

	        bookmarkStore.displayFolders.sort(function(a,b){return a.originalName.localeCompare(b.originalName)});
			bookmarkStore.unlabelled = bookmarkStore.bookmarks[service.folderUnlabelled.id];


			console.log(bookmarkStore.displayFolders);

			// update labels with total count in each folder
			_.each(bookmarkStore.displayFolders, function (labelEntry) {
				var label = labelEntry.id;
				var items = bookmarkStore.bookmarks[label];

				labelEntry.count = items.length;
				labelEntry.name = labelEntry.originalName+" ("+labelEntry.count+")"; // <--- label display name
				console.log("Found " + items.length + " in " + label);
			});


			// create urls map for faster access
			// todo move out from this method. this doesnt change on filter
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
			var scopeBookmarks = bookmarkStore.bookmarks;

			if (inputUrl && urlsMap[inputUrl]){
				var bookmarkId = urlsMap[inputUrl][0]; // get first bookmarks that match entered url
				var bookmarksAll = _.flatten(_.values(scopeBookmarks), true);
				var bookmarks = _.filter(bookmarksAll, function(b){return b.id == bookmarkId});
				if (bookmarks){
					console.log(bookmarks);
					var b = bookmarks[0];
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
			// urlMap = { url1: [bId1, bId2], url2: [bId1, bId3]}
			// folders = [ {id: abc, name: alphabet (17), originalName: abc, count: 17},  {}]
			// bookmarks = { abc: [b1, b2 .. b17],  xyz: [b1]}

		},

        getExampleStore : function(){
            var example = [
                    {url:"http://stackoverflow.com/questions/101268/hidden-features-of-python", title: "Hidden features of python", id: 1, labels: ["Development"]},
       				{url: "https://people.gnome.org/~federico/news-2008-11.html#pushing-and-pulling-with-git-1", title: "Pushing and pulling with git", id: 2, labels: ["Development"]},
       				{url: "http://nealford.com/memeagora/2013/01/22/why_everyone_eventually_hates_maven.html", title: "Why everyone eventually hates maven", id: 3, labels: ["Development"]},
       				{url: "http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol", title: "SRP protocol", id: 4, labels: ["Development"]},
       				{url: "http://www.sans.org/security-resources/sec560/netcat_cheat_sheet_v1.pdf", title: "Netcat cheat sheet", id: 5, labels: ["Development", "Unix"]},
       				{url: "http://clippy.in/b/YJLM9W", title: "Favorite Linux Commands", id: 11, labels: ["Unix"]},
       	   			{url: "https://gist.github.com/nifl/1178878", title: "Grok vi", id: 12, labels: ["Unix"]}];
            return service.filterByPartial({all:example, filterOn:false}, []);
        }
	};
	return service;
});

/*bookmarkStore.folders = [];
 bookmarkStore.bookmarks = {};

 _.each(_.unique(_.flatten(_.pluck(bookmarks, "labels"), true)), function(label){
 bookmarkStore.folders.push( {id: label, originalName: label, count: 0} );
 bookmarkStore.bookmarks[label] = [];
 });

 bookmarkStore.bookmarks[result.folderUnlabelled.id] = [];
 bookmarkStore.bookmarks[result.folderAll.id] = bookmarks;

 // group bookmarks into folders (labels)
 _.each(bookmarks, function(b){
 var labels;
 if (b.labels.length == 0){
 labels = [folderUnlabelled.id]
 }else{
 labels = b.labels;
 }
 _.each(labels, function(label){
 bookmarkStore.bookmarks[label].push({id: b.id, url: b.url, title: b.title, labels: b.labels, label: label})
 });
 });


 bookmarkStore.displayFolders = [];
 bookmarkStore.displayFolders.push.apply(bookmarkStore.displayFolders, bookmarkStore.folders);
 bookmarkStore.displayFolders.push(folderAll);
 if (bookmarkStore.bookmarks[folderUnlabelled.id].length>0)
 bookmarkStore.displayFolders.push(folderUnlabelled);

 bookmarkStore.unlabelled = bookmarks[folderUnlabelled.id];


 console.log(bookmarkStore.displayFolders);

 // update labels with total count in each folder
 _.each(bookmarkStore.displayFolders, function (labelEntry) {
 var label = labelEntry.id;
 var items = bookmarkStore.bookmarks[label];

 labelEntry.count = items.length;
 labelEntry.name = labelEntry.originalName+" ("+labelEntry.count+")"; // <--- label display name
 console.log("Found " + items.length + " in " + label);
 });


 // create urls map for faster access
 bookmarkStore.urlsMap = {};
 var urls = _.each(_.pluck(bookmarks, 'url'), function(url){bookmarkStore.urlsMap[url] = []});
 _.each(bookmarks, function (bookmark) {
 var idsList = bookmarkStore.urlsMap[bookmark.url];
 if (!_.contains(idsList, bookmark.id)){
 idsList.push(bookmark.id);
 }
 });*/