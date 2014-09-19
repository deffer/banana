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

@Path("/rest/bookmarks/{action}")
class RestApiBookmarkStencil implements Stencil{
	private static final Logger log = LoggerFactory.getLogger(RestApiBookmarkStencil)
	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	SimpleDateFormat DF = new SimpleDateFormat("yyyy-MM-dd HH:mm")

	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {
		String action = pathParameters['action'].toLowerCase()
		response.setHeader("Content-Type", "application/json");

		if (action in ['get', 'download']){
			def data
			String currentUser = userStore.userId
			log.debug("Getting for: User $currentUser, session ${userStore.sessionId}")

			if (currentUser){
				data = bookmarksStore.getUserBookmarks(currentUser, false)
			}else{
				data = bookmarksStore.getSessionBookmarks(userStore.sessionId, false)
			}

			if (action == 'download'){
				String fileName = "$currentUser ${DF.format(new Date())}.txt"
				response.setHeader("Content-Disposition", "attachment; filename=\"$fileName\";");
			}

			response.writer.write(JacksonHelper.serialize(data));

		}else{
			response.writer.write('"a":"b"')
		}

	}
}
