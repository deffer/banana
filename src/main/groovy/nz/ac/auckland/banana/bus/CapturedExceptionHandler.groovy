package nz.ac.auckland.banana.bus

import groovy.transform.CompileStatic
import nz.ac.auckland.common.stereotypes.UniversityComponent
import nz.ac.auckland.syllabus.errors.SyllabusExceptionHandler
import nz.ac.auckland.syllabus.payload.ErrorResponse


@UniversityComponent
@CompileStatic
class CapturedExceptionHandler implements SyllabusExceptionHandler<CapturedException> {

	@Override
	ErrorResponse handleError(CapturedException exception) {
		return new ErrorResponse(error: exception.getMessage(), context: [lines: exception.details])
	}
}
