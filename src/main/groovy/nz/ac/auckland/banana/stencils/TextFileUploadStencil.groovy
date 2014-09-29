package nz.ac.auckland.banana.stencils

import nz.ac.auckland.stencil.Stencil
import nz.ac.auckland.util.JacksonHelper
import org.apache.commons.fileupload.FileItem
import org.apache.commons.fileupload.disk.DiskFileItemFactory
import org.apache.commons.fileupload.servlet.ServletFileUpload
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Stencil for uploading (accepting) small text files.
 * Returns content as string (descendants need to implement one abstract method accepting the content)
 *
 * author: Irina Benediktovich - http://plus.google.com/+IrinaBenediktovich
 */
abstract class TextFileUploadStencil implements Stencil{
	private Logger log = LoggerFactory.getLogger(getClass())

	int maxSize = 1024*1024*10

	abstract void acceptFile(String name, String body, HttpServletResponse response);

	/**
	 * Override to provide different max file size.
	 * Note that content is returned as a string, therefore size shouldn't be very big.
	 * @return file size in bytes. Anything bigger will be rejected with exception from apache commons.
	 */
	public int getMaxFileSize(){
		return maxSize
	}

	/**
	 * Override to manually handle errors.
	 * Currently only one error is supported: not a multi part request. Also exceptions.
	 * @param message
	 * @param response
	 */
	@SuppressWarnings("static-method")
	public void handleError(String message, HttpServletResponse response){
		response.setHeader("Content-Type", "application/json");
		response.setContentType("application/json");
		response.writer.write(JacksonHelper.serialize([error: message]));
	};


	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {
		// Check that we have a file upload request
		boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		if( !isMultipart ){
			handleError("Not a multipart", response);
			return
		}

		response.setContentType("text/html");

		// Create a factory for disk-based file items. Technically this code will never need to create a file,
		//    but factory is required by API.
		DiskFileItemFactory factory = new DiskFileItemFactory(getMaxFileSize()*2, new File(System.getProperty("java.io.tmpdir")));

		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);
		upload.setSizeMax( maxFileSize ); // maximum file size to be uploaded.

		try{
			List fileItems = upload.parseRequest(request); // Parse the request to get file items.

			Iterator i = fileItems.iterator();

			while ( i.hasNext () ){
				FileItem fi = (FileItem)i.next();
				if ( !fi.isFormField () ){
					// Get the uploaded file parameters
					String fieldName = fi.getFieldName();
					String fileName = fi.getName();
					String contentType = fi.getContentType();
					boolean isInMemory = fi.isInMemory();
					long sizeInBytes = fi.getSize();
					// Write the file
					/*if( fileName.lastIndexOf("\\") >= 0 ){
						file = new File( filePath + fileName.substring( fileName.lastIndexOf("\\"))) ;
					}else{
						file = new File( filePath + fileName.substring(fileName.lastIndexOf("\\")+1)) ;
					}
					fi.write( file ) ;*/

					String body = fi.inputStream.text

					log.debug("Accepted file $fileName size ${sizeInBytes}b")
					log.trace(body.take(300).toString())
					acceptFile(fileName, body, response)
				}
			}

		}catch(Exception ex) {
			log.error(ex.getMessage(), ex);
			handleError(ex.getMessage(), response);
		}
	}
}
