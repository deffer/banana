package nz.ac.auckland.banana.stencils

import nz.ac.auckland.stencil.Stencil
import org.apache.commons.fileupload.FileItem
import org.apache.commons.fileupload.disk.DiskFileItemFactory
import org.apache.commons.fileupload.servlet.ServletFileUpload

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


abstract class TextFileUploadStencil implements Stencil{

	int maxFileSize = 1024*1024*5

	abstract void acceptFile(String name, String body, HttpServletResponse response);

	void render(HttpServletRequest request, HttpServletResponse response, Map<String, String> pathParameters) {
		// Check that we have a file upload request
		boolean isMultipart = ServletFileUpload.isMultipartContent(request);
		response.setContentType("text/html");
		PrintWriter out = response.getWriter( );
		if( !isMultipart ){
			response.setHeader("Content-Type", "application/json");
			response.setContentType("text/html");
			response.writer.write("{\"error\":\"Not a mulitpart\"}");
			return;
		}

		// Create a factory for disk-based file items
		//DiskFileItemFactory factory = new DiskFileItemFactory(maxFileSize*2, yourTempDirectory);
		DiskFileItemFactory factory = new DiskFileItemFactory(maxFileSize*2, new File("c:\\temp"));

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

					print "File $fileName size ${sizeInBytes}b"
					println body.take(300)
					acceptFile(fileName, body, response)
				}
			}

		}catch(Exception ex) {
			System.out.println(ex);
		}
	}
}
