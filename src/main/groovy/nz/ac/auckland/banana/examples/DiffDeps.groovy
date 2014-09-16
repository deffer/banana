package nz.ac.auckland.banana.examples

String fnameDeps = "banana_deps.txt"
String fnameRunline = "run_line.txt"

/**
 * run_line.txt is expected to contain lines of next format
 * C:\Users\deffer\.m2\repository\nz\ac\auckland\composite\composite-s3-webjar\5.2\composite-s3-webjar-5.2.jar;
 * groups: 1- group, 2- artifact, 3- version, 4-filename
 */
def regexRunLine = /.*\.m2\\repository\\(.*)\\([^\\]+)\\([^\\]+)\\([^\\]+);/

/**
 * deps.txt is expected to contains lines in next format (MUST have 4 colons in it to separate group:artifactId:package:version:scope)
 [INFO] |  |  |  |     +- net.stickycode:sticky-metadata-reflective:jar:2.2:compile (version selected from constraint [2.2,3))
 [INFO] |  |  |  |     \- net.stickycode.bootstrap:sticky-bootstrap-spring3:jar:1.3:compile (version selected from constraint [1.3,3))
 groups: 1- group, 2- artifact, 3- package, 4- version, 5-scope
 */
def regexDeps = /\s*\Q[INFO]\E(?:[\s\|\+\-\\]*)([^\s\:]+)\:([^\s\:]+)\:([^\s\:]+)\:([^\s\:]+)\:.*/


List depsFailing = []
List depsGood = []

new File(fnameRunline).readLines().each {String inputLine->
	String line = inputLine.trim()
	def matcher = line =~ regexRunLine
	if (matcher.matches()) {
		def match = matcher[0]
		String groupAsFolder = match[1]
		String artifactName = match[2]
		String version = match[3]
		depsGood << [group: groupAsFolder.replaceAll("\\\\", "."), artifact: artifactName, version: version]
	}else{
		println "R- $line"
	}
}

new File(fnameDeps).readLines().each {String inputLine ->
	String line = inputLine.trim()
	def matcher = line =~ regexDeps
	if (matcher.matches()){
		def match = matcher[0]
		String groupAsFolder = match[1]
		String artifactName = match[2]
		String version = match[4]
		depsFailing << [group: groupAsFolder.replaceAll("\\\\", "."), artifact: artifactName, version: version]
	}else{
		println "D- $line"
	}
}

depsFailing.each {entry->
	def goodOnes = depsGood.findAll{
		return entry.group == it.group && entry.artifact == it.artifact
	}

	if (!goodOnes || goodOnes.size()>1){
		println "Cant find version of ${entry.group}:${entry.artifact} - ${goodOnes}"
	}else{
		if (entry.version != goodOnes.first().version){
			println "Version doesnt match for ${entry.group}:${entry.artifact} - ${entry.version} should be ${goodOnes.first().version}"
		}
	}
}