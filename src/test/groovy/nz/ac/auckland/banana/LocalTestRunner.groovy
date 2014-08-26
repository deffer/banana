package nz.ac.auckland.banana


import org.junit.Test
import bathe.BatheBooter



class LocalTestRunner{
	@Test
	public void runWebApplication(){
		new BatheBooter().runWithLoader(null, null,
				"nz.ac.auckland.war.WebAppRunner",
				["-Pclasspath:/war.properties",
				"-P${System.getProperty('user.home')}/.webdev/banana.properties"] as String[])
	}
}
