package nz.ac.auckland.banana.stencils

import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.stencil.DefaultStencil
import nz.ac.auckland.stencil.Path
import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.stencil.StencilService

import javax.inject.Inject
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * NamedStencil maps this class to /WEB-INF/stencils/bookmarks (based on class name)
 */
@Path("/b")
@DefaultStencil
class IndexStencil implements Stencil {

	@Inject StencilService pageService
	@Inject UserStore userStore

	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {
		pageService.renderJsp(request, response, '/WEB-INF/stencils/bookmarks.jsp',
				[sessionToken:userStore.sessionToken,
				contextPath: request.getContextPath()]
		)
	}

}
