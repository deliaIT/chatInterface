var express = require('express');
var router = express.Router();
var chatCtrl = require('../controllers/chat_controller');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'chat',
    userId1: 1,
    userName1: 'Laura',
    userId2: 2,
    userName2: 'Bob',
    conversationId1: '10000',
    conversationId2: '10000'
  });
});

router.post(['/fetchChatData', '/postMsg'], function (req, res, next) {
  chatCtrl.fetchChatData(req, res);
});

module.exports = router;
