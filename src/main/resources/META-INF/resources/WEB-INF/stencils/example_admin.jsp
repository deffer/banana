<%@ taglib uri="http://jawr.net/tags" prefix="jawr" %>
<%@ taglib uri="http://java.sun.com/jstl/core" prefix="c" %>
<%@ taglib uri="http://auckland.ac.nz/tld/scraper" prefix="uni" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html ng-app="admin-app">
<head>
    <uni:headContributions/>

    <%--stylesheet includes --%>
    <jawr:style src="/bundles/all.css"/>

    <script src="app-resources/global.js"></script>
    <script src="app-resources/session.js"></script>
    <script>

        JS_SETTINGS = {
            resultsPerPage: 10
        };
        UOA.baseUrl = '<%=request.getContextPath()%>';

    </script>
    <!-- wibble -->
    <jawr:script src="/bundles/core-libs.js"/>
    <jawr:script src="/bundles/third-party.js"/>
    <jawr:script src="/bundles/admin-third-party.js"/>
    <jawr:script src="/bundles/utils.js"/>
    <jawr:script src="/bundles/lib.js"/>
    <jawr:script src="/bundles/uoa-angular.js"/>
    <jawr:script src="/bundles/shared-angular.js"/>
    <jawr:script src="/bundles/search-app.js"/>
    <jawr:script src="/bundles/admin-app.js"/>


    <title>Find a Thesis | University of Auckland</title>
</head>
<body class="fat">
<uni:body>
    <div id="fat-admin" class="uoa-form uoa-common" ng-view>&nbsp;</div>
</uni:body>
</body>
</html>