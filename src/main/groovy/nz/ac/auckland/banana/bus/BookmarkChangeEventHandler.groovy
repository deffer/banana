package nz.ac.auckland.banana.bus

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.events.Event
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject


@UniversityComponent
@Event(name="change", namespace = "bookmarks")
class BookmarkChangeEventHandler{
	private static final Logger log = LoggerFactory.getLogger(BookmarkChangeEventHandler)

	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	BookmarkChangeResponse handleEvent(BookmarkChangeRequest requestType) throws Exception {
		// TODO check csrf token
		String action = requestType.action?.toLowerCase()

		String responseId = requestType.id
		if (action=='delete'){
			log.info("Deleting bookmark ${requestType.id}")
			// TODO delete bookmark
			return new BookmarkChangeResponse(id: responseId)
		}else{
			def bookmark = requestType.properties.subMap(['id', 'title', 'url', 'labels'])
			bookmarksStore.prepareBookmark(bookmark)

			String currentUser = userStore.userId
			log.debug("Saving for: User $currentUser, session ${userStore.sessionId}")

			if (currentUser){
				responseId = bookmarksStore.saveUserBookmark(currentUser, bookmark)
			}else{
				responseId = bookmarksStore.saveSessionBookmark(userStore.sessionId, bookmark)
			}
			return new BookmarkChangeResponse(id: responseId, title: bookmark.title, url: bookmark.url, labels: bookmark.labels)
		}
	}

	static class BookmarkChangeRequest extends BasicRequest{
		String action
		String id
		String title
		String url
		String labels
	}

	static class BookmarkChangeResponse extends BasicRequest{
		String id
		String title
		String url
		List<String> labels
	}
}
