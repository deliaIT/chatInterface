module.exports = (function () {

  //To assign each conversation object an id number and creat a conversation object to store all conversations
  var idCount = 10000,
    conversations = {};

  return function (fetchOnly) {

    if (fetchOnly) {
      return {
        getConversation: function (id) {
          return conversations[id];
        }
      }
    }

    //Private fields that can't be accessed directly by conversation instance
    var msgs = [],
      usersMap = {},
      isTypingList,
      id = idCount++,
      self;

    //Return getters and setters
    self = {
      getConversation: function (id) {
        return conversations[id];
      },
      getUserById: function (id) {
        return usersMap[id];
      },
      addUser: function (user) {
        usersMap[user.getId()] = user;
        usersMap[user.getId()].isTyping = false;
      },
      getMsgs: function () {
        return msgs;
      },
      addMsg: function (msg) {
        msgs.push(msg);
      },
      getIsTypingList: function (curUserId) {
        isTypingList = [];
        for (let id in usersMap) {
          if (id != curUserId && usersMap[id].isTyping) {
            isTypingList.push(usersMap[id].getName());
          }
        }
        return isTypingList;
      },
      setIsTyping: function (id, bool) {
        usersMap[id].isTyping = bool;
      },
      getId: function () {
        return id;
      }
    };
    conversations[self.getId()] = self;

    return self;

  };

})();