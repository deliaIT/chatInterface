var express = require('express');
var router = express.Router();
var chatCtrl = require('../controllers/chat_controller');

/* GET home page. */
//hard coded user info for demo purpose.
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'chat',
    userId1: 1,
    userName1: 'Laura',
    userId2: 2,
    userName2: 'Rob',
    conversationId1: '10000',
    conversationId2: '10000'
  });
});

router.post(['/fetchChatData', '/postMsg'], function (req, res, next) {
  chatCtrl.fetchChatData(req, res);
});

module.exports = router;
