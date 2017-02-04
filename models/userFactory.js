module.exports = (function() {
  
  //Shared by all instances
  var idCount = 1;

  return function(paramNname) {

    var name = paramNname;
    var id = idCount++;

    return {
      getName: function() {
        return name;
      },
      setName: function(newName) {
        name = newName;
      },
      getId: function() {
        return id;
      }
    };

  };

})();