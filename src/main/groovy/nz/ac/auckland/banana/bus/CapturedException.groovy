package nz.ac.auckland.banana.bus

import groovy.transform.CompileStatic

/**
 * author: Irina Benediktovich - http://plus.google.com/+IrinaBenediktovich
 */
@CompileStatic
class CapturedException extends RuntimeException {
	List<String> details = []

	public CapturedException(String message) {
		super(message)
	}

	public CapturedException(String message, List<String> details) {
		super(message)
		this.details = details
	}
}
