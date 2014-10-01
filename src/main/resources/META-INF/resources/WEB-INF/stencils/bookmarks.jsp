<%@ taglib uri="http://jawr.net/tags" prefix="jawr" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html ng-app="igoogleApp" >
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
		var iBookmarks = iBookmarks || {};
		iBookmarks.baseUrl = '<%=request.getContextPath()%>';
		iBookmarks.sessionToken = "${sessionToken}";
	</script>

	<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap.min.css" rel="stylesheet"/>
	<!--link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css"-->

	<%--stylesheet includes --%>
	<jawr:style src="/bundles/all.css"/>

	<script src="app-resources/global.js"></script>
	<!--script src="app-resources/session.js"></script-->

	<%--<link href="${contextPath}/css/app.css" rel="stylesheet"/>--%>
	<%--<link href="${contextPath}/localcss/bootstrap-2.3.2.min.css" rel="stylesheet"/>--%>

	<!-- wibble -->
	<jawr:script src="/bundles/third-party.js"/>
	<jawr:script src="/bundles/banana-app.js"/>

	<!-- integrate Underscore.string with Underscore -->
	<script type="text/javascript">_.mixin(_.str.exports());</script>

	<title>iBookmarks</title>

	<script type="text/ng-template" id="/alert.html">
		<div class="alert" ng-class="['alert-' + (alert.type || 'warning'), alert.closeable ? 'alert-dismissable' : null]" role="alert">
			<button ng-show="alert.closeable" type="button" class="close" data-dismiss="alert" ng-click="closeClick()">&times;</button>
			<strong> {{alert.message}} </strong>
			<ul>
				<li ng-repeat="line in alert.details">{{line}}</li>
			</ul>
		</div>
	</script>

</head>

<body>

<div class="container">

<div class="well well-large"> <div class="row">

	<div ng-controller="iBookmarks.app.LoginCtrl" class="span4">
		<div ng-show="!signedIn" style="margin-bottom: 10px;">
			<span> You are not logged in.
				<a href="" class="nicetooltip">More info
			    <span>
			        <img class="callout" src="img/callout.gif" />
			        <strong>Sign in to start saving your bookmarks.</strong><br />
				    No information about your google account will be stored except your id.<br>
				    If you don't want to sign in right now, you can try example bookmarks below. All information you enter will be lost after you leave this application.
			    </span>
				</a>
			</span>
		</div>
		<div id="gConnect" ng-show="!signedIn">
			<button class="g-signin"
			        data-scope="https://www.googleapis.com/auth/plus.me"
			        data-clientId="405635638148-34r0rg7p4lt9ov2p8elbaos6jqlrqba6.apps.googleusercontent.com"
			        data-accesstype="offline"
			        data-callback="onSignInCallback"
			        data-theme="dark"
			        data-cookiepolicy="single_host_origin">
			</button>
		</div>

		<div ng-show="signedIn">
			<div>
			You are logged in as
			<span title="Your google id is: {{authnInfo.userid}}" ng-show="authnInfo.name">{{authnInfo.name}}</span>
			<span ng-show="!(authnInfo.name)">
				<a href="#" class="nicetooltip">{{authnInfo.userid}}
			    <span>
			        <img class="callout" src="img/callout.gif" />
			        <strong>Your name is not available</strong><br />
				    Your google profile does not have a name attached to it.
			    </span>
				</a>
			</span>
			</div>
			<div><button class="btn" ng-click="logOut()">Log out</button> </div>
		</div>
	</div>
	<div ng-controller="iBookmarks.app.AlertsPopupCtrl" class="span6" style="min-height: 75px;">
		<bm-alert ng-repeat="alert in alertsPopup track by $index" alert-object="alert"></bm-alert>
	</div>
</div></div>

<div ng-controller="iBookmarks.app.AlertsCtrl">
	<bm-alert ng-repeat="alert in alerts track by $index" alert-object="alert" on-alert-close="closeAlertCallback($index)"></bm-alert>
</div>


<div ng-controller="iBookmarks.app.BookmarksCtrl" name="leftColumn">

	<div class="well span4">

		<div name="manageBlock">
			<div class="controls controls-row">
				<!--input class="span3" type="text" style="display:block;" ng-model="filterInput" ng-change="onFilterChange()" placeholder="search..."-->
				<div class="input-append">
					<input class="span2" id="appendedInputButton" type="text" ng-model="filterInput"
					       ng-on-enter="filterKeypress()" placeholder="filter...">
					<button class="btn" type="button" ng-click="filterAction()" ng-disabled="!validFilter()">Go!
					</button>
				</div>

				<div class="btn-group pull-right" style="margin-bottom: 10px;">
					<button class="btn span1 dropdown-toggle" data-toggle="dropdown">
						Edit
						<span class="caret"></span>
					</button>
					<ul class="dropdown-menu">
						<li><a href="" ng-click="openAddBookmark()">Quick add..</a></li>
						<li><a href="" ng-click="openImport()">Import from file..</a></li>
						<li><a href="" ng-click="export2JSON()" class="pull-left">Export...</a>
							<i class="icon-download-alt pull-left" style="margin-top: 7px;"></i></li>
						<li><a href="" class="pull-left">Edit mode </a>
							<input type="checkbox" ng-model="editMode" class="pull-left" style="margin-top: 7px;"/>
						</li>
					</ul>
				</div>

			</div>
			<div ng-show="bookmarkStore.filterOn">
				<a href="" ng-click="clearFilter()" style="font-size: small;">Clear filter</a>
			</div>

			<!-- bookmarks add panel -->
			<%@include file="_bookmarks_add.jsp" %>

			<!-- bookmarks import panel -->
			<%@include file="_bookmarks_import.jsp" %>

			<div>
				<hr>
			</div>

		</div>


	<!--select class="span4" style="display:block;" ng-model="selectedFolder"
		ng-options="folder.id as folder.name for folder in bookmarkStore.displayFolders"></select-->

		<div class="btn-group" style="margin-bottom: 10px;">
			<button class="btn span3 dropdown-toggle" data-toggle="dropdown" style="text-align: right;">
				{{selectedFolder.name}}
				<span class="caret"></span>
			</button>
			<ul class="dropdown-menu">
				<li ng-repeat="folder in bookmarkStore.displayFolders" class="cct">
					<a class="cct" href="" ng-click="setSelectedFolder(folder)"
					   ng-class="{boldit: (bookmarkStore.folders[folder.id].length>0 && bookmarkStore.filterOn)}">
						{{folder.name}}
					</a>
				</li>
			</ul>
		</div>

		<div class="offset1">
			<i title="Add bookmark" class="icon-plus" ng-click="newBookmark()" style="cursor: pointer;"></i>
		</div>

		<ul class="unstyled">
			<li ng-repeat="b in selectedBookmarks">
				<div>
					<i class="icon-remove pull-right" title="Delete" style="cursor: pointer;"
					   ng-show="editMode" ng-click="deleteBookmark(b)"></i>
					<i class="icon-pencil pull-right" title="Edit" style="cursor: pointer;"
					   ng-show="editMode" ng-click="editBookmark(b)"></i>
					<a href="{{b.url}}" target="_blank"
					   style="font-size:small; display:block; margin-left: 2px; margin-right: 50px;">-
						{{b.title}}</a>
				</div>
			</li>
		</ul>
	</div>
</div>

<%@include file="_bm_add.jsp" %>

<div ng-controller="iBookmarks.app.UtilsCtrl" name="rightColumn">
	<div class="well span6">
		<%@include file="_utils.jsp" %>
	</div>
</div>

</div> <!-- container -->
</body>
</html>