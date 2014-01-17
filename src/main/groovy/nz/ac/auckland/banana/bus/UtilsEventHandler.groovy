package nz.ac.auckland.banana.bus

import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.events.Event
import nz.ac.auckland.syllabus.events.EventHandler
import nz.ac.auckland.syllabus.payload.EventRequestBase
import nz.ac.auckland.syllabus.payload.EventResponseBase

import java.text.SimpleDateFormat
import java.util.regex.Matcher
import java.util.regex.Pattern

@UniversityComponent
@Event(name="utils", namespace = "bookmarks")
class UtilsEventHandler implements EventHandler<UtilsRequest, UtilsResponse>{

	Map<String, Closure> actions = ['timeMillis': this.&timeMillis, 'regexTest': this.&regexTest]

	@Override
	UtilsResponse handleEvent(UtilsRequest requestType) throws Exception {
		Closure call = actions.get(requestType.action)
		if (call){
			try{
				UtilsResponse result = call.call(requestType)
				return result
			}catch (Exception e){
				return new UtilsResponse(error: e.getMessage())
			}
		}else{
			return new UtilsResponse(error: "Unsupported action ${requestType.action}")
		}
	}
	UtilsResponse regexTest(UtilsRequest request){
		UtilsResponse result = new UtilsResponse()
		Matcher matcher = Pattern.compile(request.input2).matcher(request.input)

		result.output = matcher.matches()? "yes" : "no"

		return result

	}

	UtilsResponse timeMillis(UtilsRequest request){
		try{
			String input = requestType.input
			if (!input){
				input = System.currentTimeMillis().toString()
			}
			Long ilong = new Long(input)
			String output = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(new Date(ilong))
			return new UtilsResponse(output: output, input: input)
		}catch (NumberFormatException nfe){
			// expected
		}catch (Exception e){
			e.printStackTrace()
		}
		return new UtilsResponse(output: "")
	}

	static class UtilsRequest extends EventRequestBase {
		String action
		String input
		String input2
	}

	// different meaning depending on action
	static class UtilsResponse extends EventResponseBase {
		String error
		String input
		Object output
		Object[] outputs
	}
}
