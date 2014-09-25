<div name="uploadBlock span4" collapse="uploadFileCollapsed">
    <div class="alert alert-info">
        Please select
	    <a href="#" class="nicetooltip">
		    XML
		    <span>
		        <img class="callout" src="img/callout.gif" />
		        <strong>Google bookmark format</strong><br />
			    This application supports import from google bookmarks.
		    </span>
	    </a>
	    or
	    <a href="#" class="nicetooltip">
		    JSON
		    <span>
		        <img class="callout" src="img/callout.gif" />
		        If you previously exported your bookmarks with this application, you can import them back again.
		    </span>
	    </a>
	    file with your bookmarks. You can download your google bookmarks from here <a href="https://www.google.com/bookmarks/?output=xml" target="_blank">www.google.com/bookmarks/?output=xml</a>
    </div>
    <div class="control-group">
        <div class="controls">
            <input class="span3" type="text" id="uploadFileName"
                   ng-model="uploadFileName" placeholder="Select file for upload">
            <span class="btn btn-success fileinput-button pull-right" style="margin-bottom:10px; float: right;">
                <!--i class="icon-plus icon-white"></i-->
                <input type="file" name="file" id="uploadFileInput" data-url="upload/"
                       multiple="false" upload/>
                <span>File...</span>
            </span>
        </div>
    </div>
    <div>
        <button class="btn" ng-click="uploadFileCollapsed=true">Cancel</button>
        <span id="spanUpload" ng-disabled="!canUpload()" class="btn btn-primary pull-right" style="margin-bottom:10px; float: right;"
              ng-click="upload()">
            <i class="icon-upload icon-white"></i>
            <span>Upload</span>
        </span>
    </div>
</div>
