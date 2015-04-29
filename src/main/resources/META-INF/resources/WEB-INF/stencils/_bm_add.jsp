
	<div class="dumbBoxWrap">
		<div class="dumbBoxOverlay">     &nbsp; </div>
		<div class="vertical-offset">
			<div ng-controller="iBookmarks.app.ModifyCtrl" class="dumbBox" id="addBookmarkModalContainer" ng-show="visible">
		        <div name="quickEditBlock1" style="position:relative; overflow: hidden;">

			        <div class="alert alert-warning" ng-show="suggestedBookmark">
				        This url is already bookmarked as '{{suggestedBookmark.shortTitle}}' in '{{suggestedBookmark.listFolders}}'.
			            <span ng-show="!currentInputId"> Do you want to modify existing bookmark?
		                    <button class="btn btn-warning" ng-click="populateSuggested()">Modify...</button>
						</span>
			        </div>

		            <div class="controls control-row">
		                <label class="control-label" for="inputBmUrl">Url</label>
		                <input class="span4" type="text" id="inputBmUrl" placeholder="Url" ng-model="inputUrl"/>
		            </div>

		            <div class="controls control-row">
		                <label class="control-label" for="inputBmName">Name</label>
		                <input class="span4" type="text" id="inputBmName" placeholder="Name" ng-model="inputTitle"/>
		            </div>

		            <div class="controls control-row" style="margin-bottom:10px;">
		                <label class="control-label" for="inputBmFolders">Folders</label>

		                <input class="span4" ui-select2="select2Options" type="hidden"
		                       id="inputBmFolders" placeholder="Folders" ng-model="inputLabels">
		            </div>

		            <div class="controls control-row">
		                <button class="btn" ng-click="close()">Cancel</button>
		                <button type="submit" class="btn pull-right btn-primary"
		                        ng-disabled="!inputUrl"  ng-click="saveBookmark();">Save</button>
		            </div>
		        </div>
		    </div>
        </div>
    </div>
