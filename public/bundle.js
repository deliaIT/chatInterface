/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(5);

var template = __webpack_require__(3);


var app = angular.module('chat', []);

//Customized directive attribute to add ng-repeat finish-render listener 
app.directive('onFinishRender', ['$timeout', function ($timeout) {
  return {
    restrict: 'A',
    link: function link(scope, el, attr) {
      if (scope.$last) {
        $timeout(function () {
          scope.$eval(attr.onFinishRender);
        });
      }
    }
  };
}]);

app.controller('ChatCtrl', ['$scope', '$http', '$interval', '$timeout', function ($scope, $http, $interval, $timeout) {

  var stop,
      isWaiting = false,
      isTyping = false,
      timeoutHandle;

  //Initialize messages array and other users' typing status
  $scope.msgs = [];
  $scope.chatInfo = '';

  //To scroll message box to the bottom, will be triggered when finished ng-repeat rendering
  $scope.autoScroll = function () {
    $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
  };

  //background process for fecthing data from server
  $scope.fetchChatData = function () {
    //If isWaiting is true, means there is AJAX that has not finished, skip this cycle
    if (isWaiting) return;
    //AJAX will get started, is isWaiting flag to true to skip other AJAX until this AJAX is finished
    isWaiting = true;
    //Start AJAX call, notice no msg content has been sent, this is used to differentiate background
    //process and manual submit
    $http.post('/fetchChatData', {
      'msgsCount': $scope.msgs.length,
      'isTyping': isTyping,
      'userId': parseInt($scope.userId, 10),
      'conversationId': $scope.conversationId
    }).then(function (res) {
      //Update messages content as well as other user's typing status
      //isWaiting flag will be reset to false once AJAX is finished
      $scope.msgs = $scope.msgs.concat(res.data.msgs);
      $scope.chatInfo = res.data.chatInfo;
      isWaiting = false;
    }, function (res) {
      console.log('Request Failed');
      $scope.chatInfo = res.data.chatInfo;
      isWaiting = false;
    });
  };

  //Recursively fetch chat data from the server
  $scope.startInterval = function () {
    stop = $interval($scope.fetchChatData, 500);
  };

  //Stop the interval when needed
  $scope.stopInterval = function () {
    $interval.cancel(stop);
    stop = undefined;
  };

  //Stop the interval when page is destroyed.
  $scope.$on('$destroy', function () {
    $scope.stopInterval();
  });

  //Fetch new messages when hit enter or click send button
  $scope.sendMsg = function () {
    //Stop the background message fetching process
    $scope.stopInterval();
    //Make a request to get updated messages
    $http.post('/postMsg', {
      'msgsCount': $scope.msgs.length,
      'msg': $scope.inputMsg,
      'isTyping': isTyping,
      'userId': parseInt($scope.userId, 10),
      'conversationId': $scope.conversationId
    }).then(function (res) {
      //Concatenate existing messages with new messages the update the msgs model
      $scope.msgs = $scope.msgs.concat(res.data.msgs);
      //Reset the textarea to blank
      $scope.inputMsg = '';
      //Show if other user is typing
      $scope.chatInfo = res.data.chatInfo;
      //Restart background message fecthing process
      $scope.startInterval();
    }, function (res) {
      //Log error if AJAX failed
      console.log('Request Failed');
      $scope.chatInfo = res.data.chatInfo;
      $scope.startInterval();
    });
  };

  $scope.keyPress = function (ev) {
    //Check if "Enter" key has been pressed, if yes make AJAX call
    if (ev.keyCode === 13) {
      //Prevent the default behavior of pressing "Enter" key
      ev.preventDefault();
      //Reset isTyping flag for current user
      isTyping = false;
      $scope.sendMsg();
    } else {
      //Because user's pressing keys other than "Enter" key, set the isTyping flag to true
      isTyping = true;
      //Reset the timeout when there is key's been pressed within 1.5s interval
      $timeout.cancel(timeoutHandle);
      //isTyping flag will be set back to false if no key's been pressed within 1.5s interval
      timeoutHandle = $timeout(function () {
        isTyping = false;
      }, 1500);
    }
  };

  //First time start the message fetching process
  $scope.startInterval();
}]);

//Directive for both chat windows with isolated scope
//userId and conversationId are set by backend and sent into this scope by format String
app.directive('chatWindow', function () {
  return {
    restrict: 'E',
    scope: {
      userId: '@',
      userName: '@',
      conversationId: '@'
    },
    controller: 'ChatCtrl',
    template: template
  };
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)();
// imports


// module
exports.push([module.i, "body{\n\tbackground:gray;\n\tmargin:0px;\n\tfont-family: sans-serif;\n}\n\n.msg_head{\n\tbackground:#3498db;\n\tcolor:white;\n\tpadding:15px 15px 8px 15px;\n\tfont-weight:bold;\n\tborder-radius:5px 5px 0px 0px;\n}\n\n.msg_box{\n\tbackground:white;\n\tborder-radius:5px;\n  margin-top: 20px;\n}\n\n.msg_body{\n\tbackground:white;\n\theight:400px;\n\tfont-size:12px;\n\tpadding:15px;\n\toverflow:auto;\n\toverflow-x: hidden;\n}\n.msg_input{\n\twidth:100%;\n\tborder: 1px solid white;\n\tborder-top:1px solid #DDDDDD;\n  border-bottom:1px solid #DDDDDD;\n\t-webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */\n\t-moz-box-sizing: border-box;    /* Firefox, other Gecko */\n\tbox-sizing: border-box;  \n  outline: none;\n  resize: none;\n}\n\n.msg_a{\n\tposition:relative;\n\tbackground:#FDE4CE;\n\tpadding:10px;\n\tmin-height:10px;\n\tmargin-bottom:5px;\n\tmargin-right:10px;\n\tborder-radius:5px;\n\tword-wrap: break-word;\n}\n.msg_a:before{\n\tcontent:\"\";\n\tposition:absolute;\n\twidth:0px;\n\theight:0px;\n\tborder: 7px solid;\n\tborder-color: transparent #FDE4CE transparent transparent;\n\tleft:-12px;\n\ttop:4px;\n}\n.msg_header_a {\n\ttext-align: left;\n\tposition: relative;\n}\n\n\n.msg_b{\n\tbackground:#EEF2E7;\n\tpadding:10px;\n\tmin-height:15px;\n\tmargin-bottom:5px;\n\tposition:relative;\n\tmargin-left:10px;\n\tborder-radius:5px;\n\tword-wrap: break-word;\n}\n.msg_b:after{\n\tcontent:\"\";\n\tposition:absolute;\n\twidth:0px;\n\theight:0px;\n\tborder: 7px solid;\n\tborder-color: transparent transparent transparent #EEF2E7;\n\tright:-12px;\n\ttop:4px;\n}\n.msg_header_b {\n\ttext-align: right;\n\tposition: relative;\n}\n\n.chatInfo {\n  height: 20px;\n  margin-top: 5px;\n  font-size: 80%;\n  color: #EEF2E7;\n}\n\n.chat-button {\n  margin: 6px 0 6px 6px;\n}\n\n.time-stamp {\n\tfont-size: 75%;\n\tcolor: gray;\n\tposition: absolute;\n\tleft: 45%;\n}", ""]);

// exports


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = "<div class=msg_box> <div class=msg_head> <div><span ng-bind=userName></span>'s chat window</div> <div class=chatInfo ng-bind=chatInfo></div> </div> <div class=msg_wrap> <div class=msg_body> <div ng-repeat=\"msg in msgs\" on-finish-render=autoScroll()> <div ng-class=\"msg.userId === userId ? 'msg_header_b' : 'msg_header_a'\"> {{msg.sender}} <span class=time-stamp> {{msg.date | date : 'mediumTime'}} </span> </div> <div ng-class=\"msg.userId === userId ? 'msg_b' : 'msg_a'\" ng-bind=msg.content></div> </div> </div> <div class=msg_footer> <textarea class=msg_input rows=4 ng-keypress=keyPress($event) ng-model=inputMsg></textarea> <button class=\"btn btn-primary chat-button\" type=button ng-click=sendMsg()>Send</button> </div> </div> </div>";

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(1);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(4)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../../node_modules/css-loader/index.js!./chat.css", function() {
			var newContent = require("!!./../../node_modules/css-loader/index.js!./chat.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);

/***/ })
/******/ ]);