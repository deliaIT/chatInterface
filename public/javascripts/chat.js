(function () {

  var app = angular.module('chat', []);

  //Customized directive to add ng-repeat finish-render listener
  app.directive('onFinishRender', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, el, attr) {
        if (scope.$last) {
          $timeout(function () {
            scope.$eval(attr.onFinishRender);
          });
        }
      }
    }
  }]);

  app.controller('ChatCtrl', ['$scope', '$http', '$interval', '$timeout', function ($scope, $http, $interval, $timeout) {

    var stop, isWaiting = false, isTyping = false, timeoutHandle;

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
      $http
        .post('/fetchChatData', {
          'msgsCount': $scope.msgs.length,
          'isTyping': isTyping,
          'userId': parseInt($scope.userId, 10),
          'conversationId': $scope.conversationId
        })
        .then(function (res) {
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
      $http
        .post('/postMsg', {
          'msgsCount': $scope.msgs.length,
          'msg': $scope.inputMsg,
          'isTyping': isTyping,
          'userId': parseInt($scope.userId, 10),
          'conversationId': $scope.conversationId
        })
        .then(function (res) {
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
      templateUrl: '../templates/chatWindow.html'
    };
  });

})();