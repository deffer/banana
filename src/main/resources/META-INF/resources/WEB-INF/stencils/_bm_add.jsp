<div ng-controller="iBookmarks.app.ModifyCtrl" class="modal-content" id="addBookmarkModalContainer"  ng-show="!addBookmarkCollapsed">
    <div class="smoke-layer" ng-click="closeQuickAdd()"><!----></div>
    <div id="addBookmarkModalBox" class="modal-box"><!---->

        <div name="quickEditBlock1" style="position: relative; overflow: hidden;">

            <div class="alert alert-warning" ng-show="inputUrl == suggestedBookmark.url">
                This url is already bookmarked as '{{suggestedBookmark.shortTitle}}' in '{{suggestedBookmark.listFolders}}'.
                Do you want to modify existing bookmark?
                <button class="btn btn-warning" ng-click="populateSuggested()">Modify...</button>
            </div>

            <div class="controls control-row">
                <label class="control-label span1" for="inputBmUrl">Url</label>
                <input class="span3" type="text" id="inputBmUrl" placeholder="Url" ng-model="inputUrl"/>
            </div>

            <div class="controls control-row">
                <label class="control-label span1" for="inputBmName">Name</label>
                <input class="span3" type="text" id="inputBmName" placeholder="Name" ng-model="inputTitle"/>
            </div>

            <div class="controls control-row" style="margin-bottom:10px;">
                <label class="control-label span1" for="inputBmFolders">Folders</label>

                <input class="span3" ui-select2="select2Options" type="text"
                       id="inputBmFolders" placeholder="Folders" ng-model="inputLabels">
            </div>

            <div class="controls control-row">
                <button class="btn" ng-click="closeQuickAdd()">Cancel</button>
                <button type="submit" class="btn pull-right btn-primary" style="margin-bottom:10px;"
                        ng-disabled="!inputUrl"
                        ng-click="addGoogleBookmark();">Save</button>
            </div>
            <div class="controls control-group"></div>
        </div>
    </div>
</div>