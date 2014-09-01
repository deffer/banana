<%@ taglib uri="http://jawr.net/tags" prefix="jawr" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<script type="text/javascript">
		(function() {
			var po = document.createElement('script');
			po.type = 'text/javascript'; po.async = true;
			po.src = 'https://plus.google.com/js/client:plusone.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(po, s);
		})();
		var UOA = UOA || {};
		UOA.baseUrl = '<%=request.getContextPath()%>';
		UOA.sessionToken = "${sessionToken}";
	</script>

	<%--stylesheet includes --%>
	<jawr:style src="/bundles/all.css"/>

    <script src="app-resources/global.js"></script>
    <!--script src="app-resources/session.js"></script-->

	<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap.min.css" rel="stylesheet"/>
	<link href="${contextPath}/css/app.css" rel="stylesheet"/>
	<%--<link href="${contextPath}/localcss/bootstrap-2.3.2.min.css" rel="stylesheet"/>--%>

	<!-- wibble -->
	<jawr:script src="/bundles/third-party.js"/>
	<jawr:script src="/bundles/banana-app.js"/>

    <title>iBookmarks</title>
</head>
<body ng-app="igoogleApp"  ng-controller="BookmarksCtrl">
<div class="container">

    <div class="well well-large">
	    <div id="gConnect" ng-show="!signedIn">
		    <button class="g-signin"
		            data-scope="https://www.googleapis.com/auth/plus.me"
		            data-clientId="636276024216.apps.googleusercontent.com"
		            data-accesstype="offline"
		            data-callback="onSignInCallback"
		            data-theme="dark"
		            data-cookiepolicy="single_host_origin">
		    </button>
	    </div>

	    <div ng-show="signedIn">
		    You are logged in as {{authnInfo.name}}
		    <button class="btn" ng-click="logOut()">Log out</button>
	    </div>
    </div>

    <div name="leftColumn">

        <div class="well span4">

        <div name="manageBlock">
            <div class="controls controls-row">
                <!--input class="span3" type="text" style="display:block;" ng-model="filterInput" ng-change="onFilterChange()" placeholder="search..."-->
                <div class="input-append">
                    <input class="span2" id="appendedInputButton" type="text" ng-model="filterInput" ng-on-enter="filterKeypress()" placeholder="filter...">
                    <button class="btn" type="button" ng-click="filterAction()" ng-disabled="!validFilter()">Go!</button>
                </div>

                <div class="btn-group pull-right" style="margin-bottom: 10px;">
                    <button class="btn span1 dropdown-toggle" data-toggle="dropdown">
                        Edit
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li class="cct"><a href="" ng-click="openAddBookmark()">Quick add..</a></li>
                        <li class="cct"><a href="" ng-click="openImport()">Import from file..</a></li>
                        <li class="cct"><a href="" ng-click="export2JSON()">Export..</a></li>
                        <li class="cct"><a href="" class="pull-left">Edit mode </a>
                            <input type="checkbox" ng-model="editMode" class="pull-left"/>
                        </li>
                    </ul>
                </div>

            </div>
            <div ng-show="bookmarkStore.filterOn">
                <a href="" ng-click="clearFilter()" style="font-size: small;">Clear filter</a>
            </div>

            <%@include file="_bookmarks_add.jsp" %>
            <%@include file="_bookmarks_import.jsp" %>

            <div>
                <hr>
            </div>

        </div>


	    <!-- %@include file="_bm_add.jsp" % -->

        <select class="span4" style="display:block;"
                ng-model="selectedFolder" ng-options="folder.id as folder.name for folder in bookmarkStore.displayFolders"></select>

        <ul class="unstyled">
            <li ng-repeat="b in selectedBookmarks">
                <div>
                    <i class="icon-remove pull-right" title="Delete" style="cursor: pointer;"
                       ng-show="editMode" ng-click="deleteBookmark(b)"></i>
                    <i class="icon-pencil pull-right" title="Edit" style="cursor: pointer;"
                       ng-show="editMode" ng-click="editBookmark(b)"></i>
                    <a href="{{b.url}}" target="_blank"
                       style="font-size:small; display:block; margin-left: 2px; margin-right: 50px;">- {{b.title}}</a>
                </div>
            </li>
        </ul>
        </div>
    </div>

    <div name="rightColumn">
        <div class="well span6">
			<%@include file="_utils.jsp" %>
        </div>
    </div>
</div> <!-- container -->
</body>
</html>