package nz.ac.auckland.banana.stencils

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.stencil.Path
import nz.ac.auckland.util.JacksonHelper
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.text.SimpleDateFormat

@Path("/download/{code}")
class RestApiBookmarkStencil implements Stencil{
	private static final Logger log = LoggerFactory.getLogger(RestApiBookmarkStencil)
	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	SimpleDateFormat DF = new SimpleDateFormat("yyyy-MM-dd HH:mm")

	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {
		String currentUser = userStore.userId

		if (!userStore.validateTemporaryAccessKey(pathParameters['code'], currentUser?:userStore.sessionId)){
			throw new Exception("Unauthorised");
		}

		log.debug("Loading bookmarks of $currentUser, session ${userStore.sessionId}")

		def data = currentUser ? bookmarksStore.getUserBookmarks(currentUser, false): bookmarksStore.getSessionBookmarks(userStore.sessionId, false)

		String result = JacksonHelper.serialize(data)
		String fileName = "$currentUser ${DF.format(new Date())}.txt"
		response.setHeader("Content-Type", "application/json"); // not sure if necessary
		response.setHeader("Content-Disposition", "attachment; filename=\"$fileName\";");
		log.info("Returning ${result.length()} characters as a file")

		response.writer.write(result);

	}
}
