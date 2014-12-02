package nz.ac.auckland.banana.bus

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse

import com.google.api.client.http.HttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.JsonFactory
import com.google.api.client.json.jackson2.JacksonFactory
import nz.ac.auckland.banana.services.UserStore
import nz.ac.auckland.common.config.ConfigKey
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.events.Event
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.inject.Inject

/**
 * author: Irina Benediktovich - http://plus.google.com/+IrinaBenediktovich
 */
@UniversityComponent
@Event(name="gplusauth", namespace = "bookmarks")
class AuthEventHandler{
	Logger log = LoggerFactory.getLogger(this.class)

	private static final HttpTransport TRANSPORT = new NetHttpTransport();
	private static final JsonFactory JSON_FACTORY = new JacksonFactory()
	static String CLIENT_ID='405635638148-34r0rg7p4lt9ov2p8elbaos6jqlrqba6.apps.googleusercontent.com'

	@ConfigKey('banana.ga.secret')
	String CLIENT_SECRET = 'blah'

	@Inject UserStore userStore


	AuthResponse handleEvent(AuthRequest requestType) throws Exception {
		log.warn("\nAuthenticating User: ${requestType.userid}  \nCode: ${requestType.code} \nSession token: ${requestType.sessionToken}\nSecret: ${CLIENT_SECRET}")

		if (requestType.sessionToken != userStore.getSessionToken()){
			log.error("Session token wrong!!! Current token is ${userStore.getSessionToken()}")
			throw new CapturedException("Unauthorised request: token error")
		}
		String id = askGoogle4Token(requestType.code)
		if (id != requestType.userid){
			throw new CapturedException("Unauthorised request: identities mismatch")
		}
		userStore.setUserId(requestType.userid)
		return new AuthResponse(message: "ok")
	}

	String askGoogle4Token(String code){
		try {
			// Upgrade the authorization code into an access and refresh token.
			GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(TRANSPORT, JSON_FACTORY,
						CLIENT_ID, CLIENT_SECRET, code, "postmessage").execute();

			// You can read the Google user ID in the ID token.
			GoogleIdToken idToken = tokenResponse.parseIdToken()
			String gplusId = idToken.getPayload().getSubject()  //getUserId(); is deprecated
			log.debug("Received: subject=${idToken.getPayload().getSubject()} and whole response is \n${tokenResponse.toString()}")

			// Store the token in the session for later use.
			//request.getSession().setAttribute("token", tokenResponse.toString());

			return gplusId;
		} catch (Exception e) {
			e.printStackTrace()
			log.error(e.getMessage(), e)
			return null
		}
	}

	static class AuthRequest extends BasicRequest{
		String userid
		String code
	}

	static class AuthResponse{
		String message
	}
}
