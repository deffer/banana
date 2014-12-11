package nz.ac.auckland.banana.stencils

import nz.ac.auckland.banana.services.BookmarksStore
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.stencil.Path
import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.util.JacksonHelper
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.text.SimpleDateFormat

@Path("/bliz_auth")
class AuthCallbackBlizStencil implements Stencil{
	private static final Logger log = LoggerFactory.getLogger(AuthCallbackBlizStencil)


	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {

		log.debug("Authenticating through Blizzard")

		Map<String,String> attr = new HashMap<>();
		request.getParameterMap()?.each {String k,v->
			attr.put(k,v?.toString());
		}

		String result = JacksonHelper.serialize( attr);
		response.setHeader("Content-Type", "application/json"); // not sure if necessary

		log.info("Returning parameters we've got")

		response.writer.write(result);
	}
}
