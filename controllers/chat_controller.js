var userFactory = require('../models/userFactory');
var messageFactory = require('../models/messageFactory');
var conversationFactory = require('../models/conversationFactory');

//Initialize some mock data ---------------------------------------------------------------------
var user1 = userFactory('Laura');
var user2 = userFactory('Rob');
var conversationInst = conversationFactory();
var isTypingList = [];
conversationInst.addUser(user1);
conversationInst.addUser(user2);
conversationInst.addMsg(messageFactory(user1.getId(), "This is test msg from Laura", new Date()));
conversationInst.addMsg(messageFactory(user2.getId(), "This is test msg from Rob", new Date()));
//Mock data ends ---------------------------------------------------------------------------------

//req.body.msg
//req.body.userId
//req.body.conversationId
//req.body.isTyping
module.exports.fetchChatData = function(req, res) {
  var msgs, conversation;

  conversation = conversationFactory(true).getConversation(req.body.conversationId);

  //Store sender's message if sent
  if (req.body.msg !== "" && req.body.msg !== undefined) {
    //TODO VALIDATION & NEED ADD CONVERSATION ID
    conversation.addMsg(messageFactory(req.body.userId, req.body.msg, new Date()));
  }

  //Only when first time request this page
  if (req.body.isTyping !== undefined) {
    conversation.setIsTyping(req.body.userId, req.body.isTyping);
    isTypingList = conversation.getIsTypingList(req.body.userId);
  }
  
  //Only send back the portion that haven't been sent previously
  msgs = conversation.getMsgs().slice(req.body.msgsCount);

  if (msgs.length > 0) {
    for(let i in msgs) {
      //Convert message instance to readible json data
      let user;
      msgs[i] = msgs[i].getMsg();
      user = conversation.getUserById(msgs[i].sender);
      msgs[i].sender = user.getName();
      msgs[i].userId = user.getId().toString();
      msgs[i].date = msgs[i].date;
    }
  }

  //Send back updated message list as well as isTyping info
  res.json({
    msgs: msgs,
    chatInfo: isTypingList.length > 0 ? (isTypingList.length > 1 ? isTypingList.join(', ') + 'are typing' : isTypingList[0] + ' is typing') : ''
  });
};