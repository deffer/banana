package nz.ac.auckland.banana

import nz.ac.auckland.common.testrunner.GroupAppsIntegrationTestRunner
import nz.ac.auckland.common.testrunner.GroupAppsUnitTestRunner
import nz.ac.auckland.war.TestRunner
import org.junit.runner.RunWith
import org.springframework.test.context.ContextConfiguration


@ContextConfiguration("classpath:/applicationContext.xml")
@RunWith(GroupAppsUnitTestRunner)
class LocalTestRunner extends TestRunner {

}
