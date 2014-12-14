package nz.ac.auckland.banana.stencils

import groovy.json.JsonParserType
import groovy.json.JsonSlurper
import groovyx.net.http.ContentType
import groovyx.net.http.HTTPBuilder
import groovyx.net.http.HttpResponseException
import groovyx.net.http.RESTClient
import nz.ac.auckland.common.config.ConfigKey
import nz.ac.auckland.stencil.Path
import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.util.JacksonHelper
import org.codehaus.groovy.runtime.DefaultGroovyMethods
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

		def resp = [incoming: attrCode, tokenReponse: 'ab']

		def http = new RESTClient( 'https://us.battle.net/oauth/token' )
		//http.auth.basic(CLIENT_ID, CLIENT_SECRET) // doesn't work
		def httpTokenResponse
		try{
			httpTokenResponse = http.post([
				requestContentType: ContentType.URLENC,
				contentType: ContentType.TEXT, // groovy 2.3.x cant parse JSON
	            headers: [
			        Authorization: 'Basic '+"$CLIENT_ID:$CLIENT_SECRET".bytes.encodeBase64().toString(),
			        Accept : 'application/json'],
				body: [
					grant_type: 'authorization_code',
					redirect_uri : 'https://deffer.org/bliz_auth',
					code: code]]
			)

			String content = httpTokenResponse.data?.text
			resp.tokenResposeRaw = content
			def parser = new JsonSlurper().setType(JsonParserType.LAX)
			def jsonResp = parser.parseText(content)
			resp.tokenReponse = jsonResp
		}catch (HttpResponseException he){
			String content = he.getResponse().data.text
			log.error(he.getMessage(), he)
			log.error(content)

			resp.status = he.response.status
			resp.httpError = he.response.statusLine?.toString()
			resp.tokenReponse = content
		} catch (Exception e){
			log.error(e.getMessage(),e)
			resp.error = e.getMessage()
		}


		String result = JacksonHelper.serialize(resp);
		response.writer.write(result);

	}
}
