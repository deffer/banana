package nz.ac.auckland.banana.stencils

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.stencil.Path
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element
import org.jsoup.select.Elements
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject
import javax.servlet.http.HttpServletResponse

@Path("/upload")
class RestUploadBookmark extends TextFileUploadStencil {

	private static final Logger log = LoggerFactory.getLogger(RestUploadBookmark)

	int maxFileSize = 1024 * 1024 * 5

	List files = []

	@Inject UserStore userStore
	@Inject BookmarksStore bookmarksStore

	protected List getUserStorage() {
		return files
	}


	void acceptFile(String name, String body, HttpServletResponse response){
		response.setHeader("Content-Type", "application/json");
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();

		try{
			Document doc = Jsoup.parse(body)
			Elements elements = doc.body().children().select('bookmarks')
			if (elements.size() == 1){

				String currentUser = userStore.userId
				log.debug("Adding to: User $currentUser, session ${userStore.sessionId}")
				List bookmarks = parseBookmarks(elements[0])

				if (currentUser){
					bookmarksStore.addUserBookmarks(currentUser, bookmarks)
				}else{
					bookmarksStore.addSessionBookmarks(userStore.sessionId, bookmarks)
				}

			}else{
				response.sendError(403, 'Not supported file format. Expected google bookmarks')
			}

		}catch (Exception e){
			e.printStackTrace()
			response.sendError(403, 'Unable to store file')
		}

		getUserStorage().add(body)
	}

	protected List parseBookmarks(Element bookmarkNode){
		List<Map> result = []
		int count = 0
		bookmarkNode.children().each {Element e ->
			if (e.nodeName() != 'bookmark'){
				println 'Unknown node '+e.nodeName()
			}else{
				count++
				String id = e.select('id')[0].text()
				String title = e.select('title')[0].text()
				String url = e.select('url')[0].text()
				String timestamp = e.select('timestamp')[0].text()

				Elements labels =  e.select('labels>label')
				if (labels.size()>1)
					println "${labels.size()} $url"
				def bookmark = [id:id, title:title, url:url, timestamp:timestamp, labels: labels*.text()]
				result << bookmark
			}
		}

		println "Total $count bookmarks extracted"
		return result
	}
}
