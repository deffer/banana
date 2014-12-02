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
class UtilsEventHandler {

	Map<String, Closure> actions = ['timeMillis': this.&timeMillis, 'regexTest': this.&regexTest]


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

		if (matcher.matches()){
			result.output = "yes";
			if (matcher.size()>0 && matcher[0] instanceof Collection){
				result.outputs = new ArrayList(["Groups:"]+(Collection)matcher[0]).toArray();
			}
		}else{
			if (matcher.size()>0){
				result.output = "contains";
				Collection results = matcher.collect {return it instanceof String? it : it[0]}
				result.outputs = new ArrayList(["Found matches:"]+results).toArray();
			}else{
				result.output = "no";
			}
		}

		return result
	}

	UtilsResponse timeMillis(UtilsRequest request){
		try{
			String input = request.input
			if (!input){
				input = System.currentTimeMillis().toString()
			}else{
				input = input.replaceAll(',', '')
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

	static class UtilsRequest{
		String action
		String input
		String input2
	}

	// different meaning depending on action
	static class UtilsResponse{
		String error
		String input
		Object output
		Object[] outputs
	}
}
