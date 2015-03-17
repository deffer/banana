package nz.ac.auckland.banana.examples

import nz.ac.auckland.util.JacksonHelper


//String fname = "c:\\apps\\logstash\\prototype_less_original.log"
String fname = "c:\\apps\\logstash\\prototype.log"
//String newFileName = "c:\\apps\\logstash\\prototype_less_new.log"
String newFileName = "c:\\apps\\logstash\\prototype_clean.log"


List<String> result = new ArrayList<>();

new File(fname).readLines().each { String inputLine ->

	String line = inputLine.trim()
	def lineObj = JacksonHelper.deserialize(line, Map.class);
	def toDelete = lineObj.keySet().findAll { String key ->
		return (key.startsWith("dim_")
		|| key.startsWith("fact_")
		|| key.startsWith("dss_"))
	}

	toDelete.each {String key->
		lineObj.remove(key);
	}

	result.add(JacksonHelper.serialize(lineObj));
}

File file = new File(newFileName);
result.each {String line->
	file.append(line+"\n");
}