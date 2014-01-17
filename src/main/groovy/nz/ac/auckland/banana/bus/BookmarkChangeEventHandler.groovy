package nz.ac.auckland.banana.bus

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.events.Event
import nz.ac.auckland.syllabus.events.EventHandler
import nz.ac.auckland.syllabus.payload.EventRequestBase
import nz.ac.auckland.syllabus.payload.EventResponseBase
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject


@UniversityComponent
@Event(name="change", namespace = "bookmarks")
class BookmarkChangeEventHandler implements EventHandler<BookmarkChangeRequest, BookmarkChangeResponse>{
	private static final Logger log = LoggerFactory.getLogger(BookmarkChangeEventHandler)

	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	@Override
	BookmarkChangeResponse handleEvent(BookmarkChangeRequest requestType) throws Exception {
		String action = requestType.action?.toLowerCase()

		String responseId = requestType.id
		if (action=='delete'){
			log.info("Deleting bookmark ${requestType.id}")
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
		}
		return new BookmarkChangeResponse(id: responseId)
	}

	static class BookmarkChangeRequest extends EventRequestBase {
		String action
		String id
		String title
		String url
		List<String> labels
	}

	static class BookmarkChangeResponse extends EventResponseBase{
		String id
	}
}
