package nz.ac.auckland.banana.bus

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.SyllabusContext
import nz.ac.auckland.syllabus.events.Event
import nz.ac.auckland.syllabus.http.HttpSyllabusContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject

/**
 * Generates temporary access key
 *
 * author: Irina Benediktovich - http://plus.google.com/+IrinaBenediktovich
 */
@UniversityComponent
@Event(name="download", namespace = "bookmarks")
class BookmarksDownloadRequestHandler {
	Logger log = LoggerFactory.getLogger(this.class)

	@Inject UserStore userStore

	Object handleEvent(BasicRequest requestType) throws Exception {

		if (requestType.sessionToken != userStore.getSessionToken()){
			log.error("Session token wrong!!! Current token is ${userStore.getSessionToken()}")
			throw new CapturedException("Unauthorised request: token error")
		}

		def t = userStore.requestTemporaryAccessKey(userStore.userId)
		log.debug("Returning temporary access key $t")
		return [temporaryCode: t];
	}
}
