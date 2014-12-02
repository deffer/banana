<div utils-block>


<div id="uTimeMillis" class="controls-row">
	<input class="span3" type="text" id="inputTimeMillis" placeholder="System.currentTimeMillis()" ng-model="timeMillis"/>
	<button class="btn span1" ng-click="getTimeString()">Format</button>
</div>
<div><label>{{timeString}}</label></div>

<div><hr></div>

<div>
	<div class="control-group" ng-class="{error: regexFullMatch=='no', success: regexFullMatch=='yes', warning: regexFullMatch=='contains'}">
		<div class="controls">
			<input class="span5" type="text" id="inputRegexString" placeholder="Test string"
			        ng-model="regexTestInput"/>
		</div>
	</div>

	<div class="controls-row">
		<input class="span5" type="text" id="inputRegex" placeholder="Regular Expression" ng-model="regexInput"/>
		<button class="btn span1" ng-click="regexTest()">Test</button>
	</div>

	<div><label ng-repeat="match in regexMatches">{{match}}</label></div>

</div>

<div><hr></div>

<div>
	<input class="span5" type="text" id="inputHash" placeholder="hash" ng-model="inputHash"/>
	<div class="btn-group" style="margin-bottom: 10px;">
		<button class="btn span1 dropdown-toggle" data-toggle="dropdown">...
			<span class="caret"></span>
		</button>
		<ul class="dropdown-menu">
			<li><a href="" ng-click="getHash('MD5')">MD5</a></li>
			<li><a href="" ng-click="getHash('SHA1')">SHA1</a></li>
			<li><a href="" ng-click="getHash('SHA256')">SHA256</a></li>
			<li><a href="" ng-click="getHash('SHA512')">SHA512</a></li>
		</ul>
	</div>
	<div><textarea readonly style="word-break: break-all;" class="span5" ng-show="hashOutput">{{hashOutput}}</textarea></div>
</div>

<div id="uBase64">
	<textarea class="span5" id="inputBase64" placeholder="BASE64" ng-model="base64input"></textarea>

	<div class="btn-group" style="margin-bottom: 10px;">
		<button class="btn span1 dropdown-toggle" data-toggle="dropdown">...
			<span class="caret"></span>
		</button>
		<ul class="dropdown-menu">
			<li><a href="" ng-click="encode64()">Encode</a></li>
			<li><a href="" ng-click="decode64()">Decode</a></li>
		</ul>
	</div>

	<div><textarea readonly class="span5" style="word-break: break-all;" ng-show="base64output">{{base64output}}</textarea></div>
</div>



</div>