<div ng-controller="iBookmarks.app.ModifyCtrl" class="modal-content" id="addBookmarkModalContainer"  ng-show="visible">
    <div class="smoke-layer" ng-click="close()"><!----></div>
    <div id="addBookmarkModalBox" class="modal-box"><!---->

        <div name="quickEditBlock1" style="position: relative; overflow: hidden;">

	        <div class="alert alert-warning" ng-show="inputUrl == suggestedBookmark.url">
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
                       id="inputBmFolders" placeholder="Folders" ng-model="inputLabels" style="margin-left: 100px;">
            </div>

            <div class="controls control-row">
                <button class="btn" ng-click="close()">Cancel</button>
                <button type="submit" class="btn pull-right btn-primary" style="margin-bottom:10px;"
                        ng-disabled="!inputUrl"
                        ng-click="saveBookmark();">Save</button>
            </div>
            <div class="controls control-group"></div>
        </div>
    </div>
</div>