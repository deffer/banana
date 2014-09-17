package nz.ac.auckland.banana.bus

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse


/*import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse*/
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
 *
 */
@UniversityComponent
@Event(name="gplusauth", namespace = "bookmarks")
class AuthEventHandler{
	Logger log = LoggerFactory.getLogger(this.class)
	static String CLIENT_ID='405635638148-34r0rg7p4lt9ov2p8elbaos6jqlrqba6.apps.googleusercontent.com'

	@Inject UserStore userStore

	@ConfigKey('banana.ga.secret')
	String CLIENT_SECRET = 'blah'

	/**
	 * Default HTTP transport to use to make HTTP requests.
	 */
	private static final HttpTransport TRANSPORT = new NetHttpTransport();
	/**
	 * Default JSON factory to use to deserialize JSON.
	 */
	private static final JsonFactory JSON_FACTORY = new JacksonFactory()
	/**
	 * Gson object to serialize JSON responses to requests to this servlet.
	 */
	//private static final Gson GSON = new Gson();

	AuthResponse handleEvent(AuthRequest requestType) throws Exception {
		log.warn("Authenticating User: ${requestType.userid}  \nCode: ${requestType.code} \nSession token: ${requestType.sessionToken}\nSecret: ${CLIENT_SECRET}")
		// todo user token to query gplus api to verify the userid is for this token
		if (requestType.sessionToken != userStore.getSessionToken()){
			log.error("Session token wrong!!! Current token is ${userStore.getSessionToken()}")
			// TODO do NOT authenticate
		}
		askGoogle4Token(requestType.code)
		userStore.setUserId(requestType.userid)
		return new AuthResponse(message: "ok")
	}

	String askGoogle4Token(String code){
		try {
			// Upgrade the authorization code into an access and refresh token.
			GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(TRANSPORT, JSON_FACTORY,
						CLIENT_ID, CLIENT_SECRET, code, "postmessage").execute();  // doesnt work anymore :( probably need to add something to JSON_FACTORY

			// You can read the Google user ID in the ID token.
			// This sample does not use the user ID.
			GoogleIdToken idToken = tokenResponse.parseIdToken();
			String gplusId = idToken.getPayload().getUserId();
			log.debug("Received: userid=$gplusId, subject=${idToken.getPayload().getSubject()} and whole response is \n${tokenResponse.toString()}")
			return tokenResponse.toString(); // should store the token in the session for later use.
		} catch (Exception e) {
			e.printStackTrace()
			return null
		}
	}

	static class AuthRequest{
		String userid
		String code
		String sessionToken
	}

	static class AuthResponse{
		String message
	}
}
