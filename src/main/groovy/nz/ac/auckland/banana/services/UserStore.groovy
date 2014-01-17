package nz.ac.auckland.banana.services

import nz.ac.auckland.common.stereotypes.UniversityComponent
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

import javax.servlet.http.HttpServletRequest
import java.security.SecureRandom

@UniversityComponent
class UserStore {

	private static final Logger log = LoggerFactory.getLogger(UserStore)

	static final String USER_GPLUS_ID = 'USER_GPLUS_ID'
	static final String USER_SESSION_ID = 'USER_SESSION_ID'
	static final String SESSION_TOKEN = 'SESSION_TOKEN'

	public HttpServletRequest getCurrentRequest() {
		ServletRequestAttributes servletRequestAttributes =
			RequestContextHolder.requestAttributes as ServletRequestAttributes

		HttpServletRequest request = servletRequestAttributes?.request

		return request
	}

	public String getUserId(){
		return getCurrentRequest()?.session?.getAttribute(USER_GPLUS_ID)
	}

	public String setUserId(String newUserId){
		setSessionAttr(USER_GPLUS_ID, newUserId)
	}
	public String setSessionAttr(String attr, String value){
		def session = getCurrentRequest()?.session
		if (!session){
			log.warn('Unable to retreive session. Who knows why...')
			return null
		}

		String prev = session.getAttribute(attr)
		session.setAttribute(attr, value)
		return prev
	}

	public String getSessionId(){
		String sId = getCurrentRequest()?.session?.getAttribute(USER_SESSION_ID)
		if (!sId){
			sId = currentRequest?.session?.id
			getCurrentRequest()?.session?.setAttribute(USER_SESSION_ID, sId)
		}
		return sId
	}

	String getSessionAttr(String attr){
		return getCurrentRequest()?.session?.getAttribute(attr)
	}

	String getSessionToken(){
		String result = getSessionAttr(SESSION_TOKEN)
		if (!result){
			result = new BigInteger(130, new SecureRandom()).toString(32);
			setSessionAttr(SESSION_TOKEN, result)
		}
		return result
	}


}
