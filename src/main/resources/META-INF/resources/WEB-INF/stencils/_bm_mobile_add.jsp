<div name="quickAddBlock" collapse="addBookmarkCollapsed">
    <div class="alert alert-warning" ng-show="inputUrl == suggestedBookmark.url">
        This url is already bookmarked as '{{suggestedBookmark.shortTitle}}' in '{{suggestedBookmark.listFolders}}'.
	    <span ng-show="!currentInputId"> Do you want to modify existing bookmark?
            <button class="btn btn-warning" ng-click="populateSuggested()">Modify...</button>
		</span>
    </div>

    <div class="controls control-row">
        <label class="control-label span1" for="inputUrl">Url</label>
        <input class="span3" type="text" id="inputUrl" placeholder="Url" ng-model="inputUrl"/>
    </div>

    <div class="controls control-row">
        <label class="control-label span1" for="inputName">Name</label>
        <input class="span3" type="text" id="inputName" placeholder="Name" ng-model="inputTitle"/>
    </div>

    <div class="controls control-row" style="margin-bottom:10px;">
        <label class="control-label span1" for="inputFolders">Folders</label>

        <!--select class="span3" multiple ui-select2="select2Options" id="inputFolders" placeholder="Folders" ng-model="inputLabels" >
            <option ng-repeat="item in bookmarkStore.foldersList" value="{{item.id}}">{{item.id}}</option>
        </select-->

        <input class="span3" ui-select2="select2Options" type="hidden"
               id="inputFolders" placeholder="Folders" ng-model="inputLabels">
    </div>

    <div class="controls control-row">
        <button class="btn" ng-click="closeQuickAdd()">Cancel</button>
        <button type="submit" class="btn pull-right btn-primary" style="margin-bottom:10px;"
                ng-disabled="!inputUrl"
                ng-click="addGoogleBookmark();">Save</button>
    </div>
    <div class="controls control-group"></div>
</div>