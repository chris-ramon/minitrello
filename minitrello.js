BoardCollection = new Meteor.Collection("todo");

if (Meteor.is_client) {
  // Passing variables to the templates.
  Template.board.todos = function(){
    return BoardCollection.find({state: "todo"}, {sort: {priority: 1, task: 1}});
  };
  Template.board.doings = function(){
    return BoardCollection.find({state: "doing"}, {sort: {priority: 1, task: 1}});
  };
  Template.board.dones = function(){
    return BoardCollection.find({state: "done"}, {sort: {priority: 1, task: 1}});
  };

  function insertDocument (data) {
    BoardCollection.insert(data);
  };
  function totalDocuments (arguments) {
    return BoardCollection.find(arguments).count();
  };

  // Event listeners for template board.
  Template.board.events = {
    "click button#new-todo" : function(){
      var _task = $("#new-todo-input").val(),
          total_tasks = totalDocuments({state: "todo"}) ;
      insertDocument({task : _task, state: "todo", priority: total_tasks + 1, color: Math.floor(Math.random()*10)});
    },
    "keyup" : function(event){
      if (event.keyCode == 13){
        var _task = $("#new-todo-input").val(),
          total_tasks = totalDocuments({state: "todo"}) ;
        insertDocument({task : _task, state: "todo", priority: total_tasks + 1, color: Math.floor(Math.random()*10)});
        $("#new-todo-input").val("");
      }
    },
    "click .icon-remove" : function(e){
      var _task = $(e.target).parent().parent();
        _id = _task.attr('id');
        console.log(_task.parent())
        BoardCollection.remove(_id);
        // sortable();
    }

  };

  // Listen for each list when elements are sortabling.
  Meteor.startup(function(){
    $("#new-todo-input").focus();
    var list = ["#todos", "#doings", "#dones"];

    function connectWith(currentList){
      var new_list = $.map(list, function(element, index){ if (element != currentList) return element; });
      return new_list.join();
    }

    function sortable () {

      for (var i = 0; i < list.length; i++) {
        var options = {
          placeholder: "ui-state-highlight" ,
          connectWith: connectWith(list[i]) ,
          // events.
          update: function(event, ui){
            var $this = $(this) ,
              results = $this.sortable("toArray") ,
              _id = $this.attr('id') ,
              _state = _id.substring(0,_id.length-1) ;
            for (var i = 0; i < results.length; i++)
              BoardCollection.update({_id: results[i]}, {$set: {priority: i + 1, state: _state}});
          }
        }; // finish options

        $(list[i]).sortable(options);
      };

    }

    sortable();

  });
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // Fill the board collection with documents if is empty.
    if (BoardCollection.find().count() === 0) {
      var tasks = ["PSD File",
                   "Python Scripts",
                   "Update Mongo Collection"];
      for (var i = 0; i < tasks.length; i++)
        BoardCollection.insert({task: tasks[i], state:"todo" , date: (new Date()).toLocaleDateString(), priority: i + 1, color: i + 1 });
      BoardCollection.insert({task: "AI Vectors Graphics", state:"doing" , date: (new Date()).toLocaleDateString(), priority: 1, color: 10 });
      BoardCollection.insert({task: "Logo in Photoshop", state:"doing" , date: (new Date()).toLocaleDateString(), priority: 2, color: 9 });
      BoardCollection.insert({task: "Perl Scripts", state:"done" , date: (new Date()).toLocaleDateString(), priority: 1, color: 8 });
      BoardCollection.insert({task: "Ruby BDD Scripts", state:"done" , date: (new Date()).toLocaleDateString(), priority: 2, color: 7 });
      BoardCollection.insert({task: "Django Views", state:"done" , date: (new Date()).toLocaleDateString(), priority: 3, color: 6 });
    }
  });
}