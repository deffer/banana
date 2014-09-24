package nz.ac.auckland.banana.bus

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse
import com.google.api.client.http.HttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.JsonFactory
import com.google.api.client.json.jackson2.JacksonFactory
import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.common.config.ConfigKey
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.SyllabusContext
import nz.ac.auckland.syllabus.events.Event
import nz.ac.auckland.syllabus.http.HttpSyllabusContext
import nz.ac.auckland.util.JacksonHelper
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject

/**
 * author: Irina Benediktovich - http://plus.google.com/+IrinaBenediktovich
 */
@UniversityComponent
@Event(name="get", namespace = "bookmarks")
class BookmarksRequestHandler {
	Logger log = LoggerFactory.getLogger(this.class)

	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	List handleEvent(BookmarksRequest requestType, SyllabusContext context) throws Exception {

		if (requestType.sessionToken != userStore.getSessionToken()){
			log.error("Session token wrong!!! Current token is ${userStore.getSessionToken()}")
			throw new CapturedException("Unauthorised request: token error")
		}

		def data
		String currentUser = userStore.userId
		log.debug("Getting for: User $currentUser, session ${userStore.sessionId}")

		if (currentUser) {
			data = bookmarksStore.getUserBookmarks(currentUser, false)
		} else {
			data = bookmarksStore.getSessionBookmarks(userStore.sessionId, false)
		}

		if (requestType.action == 'download'){
			HttpSyllabusContext httpSyllabusContext = (HttpSyllabusContext)context
			String fileName = "$currentUser ${new Date().format("yyyy-MM-dd HH:mm")}.txt"
			httpSyllabusContext.response.setHeader("Content-Disposition", "attachment; filename=\"$fileName\";");
		}
		return data;
	}

	public static class BookmarksRequest extends BasicRequest{
		String action
	}

}
