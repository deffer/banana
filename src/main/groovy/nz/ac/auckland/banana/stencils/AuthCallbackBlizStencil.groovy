package nz.ac.auckland.banana.stencils

import groovyx.net.http.ContentType
import groovyx.net.http.HTTPBuilder
import nz.ac.auckland.common.config.ConfigKey
import nz.ac.auckland.stencil.Path
import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.util.JacksonHelper
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Path("/bliz_auth")
class AuthCallbackBlizStencil implements Stencil{
	private static final Logger log = LoggerFactory.getLogger(AuthCallbackBlizStencil)

	private String CLIENT_ID= "p7279f6w26hhg7rwr56u7ujgn6xpqtp3"

	@ConfigKey('banana.ba.secret')
	String CLIENT_SECRET = 'blah'

	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {

		log.debug("Authenticating through Blizzard")
		response.setHeader("Content-Type", "application/json"); // not sure if necessary

		Map<String,String> attrCode = new HashMap<>();
		request.getParameterMap()?.each {String k,v->
			attrCode.put(k,v?.toString());
		}

		String state = request.getParameter("state")
		String code = request.getParameter("code")
		if (code == null ||  code.isEmpty()){
			log.info("Code is empty. Returning parameters we've got")
			attrCode.error = "Banana: Code is empty. Returning parameters we've got"
			String result = JacksonHelper.serialize( attrCode);
			response.writer.write(result);
			return
		}

		if (CLIENT_SECRET.equals("blah")){
			log.info("Client secret is not injected. Returning parameters we've got")
			attrCode.error = "Banana: Client secret is not injected. Returning parameters we've got"
			String result = JacksonHelper.serialize( attrCode);
			response.writer.write(result);
			return
		}

		def resp = [incoming: attrCode, tokenReponse: ['a':'b']]

		def http = new HTTPBuilder( 'https://us.battle.net/oauth/token' )
		//http.auth.basic(CLIENT_ID, CLIENT_SECRET)
		/*http.handler.failure = { respp ->
			println "Unexpected failure: ${respp.statusLine}"
		} */

		http.post([
			requestContentType: ContentType.URLENC,
			contentType: ContentType.JSON,
            headers: [Authorization: 'Basic '+"$CLIENT_ID:$CLIENT_SECRET".bytes.encodeBase64().toString()],
			body: [
				grant_type: 'authorization_code',
				redirect_uri : 'https://deffer.org/bliz_auth',
				code: 'gqctcebzwmp45kskh6y9y5ed'
				//code: code
		]], { req, json ->
			println "POST response status: ${resp.statusLine}"
			resp.tokenReponse = json
		});

		String result = JacksonHelper.serialize(resp);
		response.writer.write(result);

	}
}
