module.exports = function(userId, content, date) {

    return {
      getMsg: function() {
        return {
          'sender': userId,
          'content': content,
          'date': date                //Can be modified if send as an Object. Consider convert into string using some modules
        }
      }
    };

};