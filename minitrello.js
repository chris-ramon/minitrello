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
  Template.edit.task =function(){
    return "nothing to edit ...";
  };

  function insertDocument (data) {
    BoardCollection.insert(data);
  };
  function totalDocuments (arguments) {
    return BoardCollection.find(arguments).count();
  };

  // Event listeners for template board.
  Template.board.events = {
    // new task - todo
    "click button#new-todo" : function(){
      var _task = $("#new-todo-input").val(),
          total_tasks = totalDocuments({state: "todo"}) ;
      insertDocument({task : _task, state: "todo", priority: total_tasks + 1, color: Math.floor(Math.random()*10)});
    },
    "keyup" : function(event){
      if (event.keyCode == 13){
        var _task = $("#new-todo-input").val(),
          total_tasks = totalDocuments({state: "todo"}) ;
          if(_task != ""){ insertDocument({task : _task, state: "todo", priority: total_tasks + 1, color: Math.floor(Math.random()*10)});}
        $("#new-todo-input").val("");
      }
    }
  };

  // Event listeners for template options.
  Template.options.events = {
    // remove task
    "click .icon-remove" : function(e){
      var _task = $(e.target).parent().parent().parent();
        _id = _task.attr('id');
        _ul = _task.parent();
        _ul_id = _ul.attr("id");
        _state = _ul_id.substring( 0, _ul_id.length-1 );
        BoardCollection.remove(_id);
        Meteor.flush();
        tasks = _ul.sortable("toArray");
        for (var i = 0; i < tasks.length; i++)
          BoardCollection.update({_id: tasks[i]}, {$set: {priority: i + 1, state: _state}});
        console.log(_task);
        return false;
    },
    // edit task
    "click .icon-edit" : function(e){
      var _task = this ,
        _id = _task._id, 
        _task_wrapper = $("#"+_id) ,
        _task_text_wrapper = _task_wrapper.find("p:eq(0)"),
        _current_text = _task_text_wrapper.text();
        _text = $("<textarea></textarea>", {
          id : "#updating" ,
          value: _current_text 
        });
        _button = $("<button></button>", {
          id : "save_button" ,
          class : "btn" ,
          text: "Save"
        });
        _task_text_wrapper.html(_text);
        _task_text_wrapper.after(_button);
        var textarea = _task_text_wrapper.find("textarea");
        textarea.focus().val(_current_text);
        _task_wrapper.addClass("disabledhover");
        _button.on("click", function(){
          var data = textarea.val();
          BoardCollection.update(_id, {$set: {task: data} });
        });
      return false;
    }
  };

  // Listen for each list when elements are sortabling.
  Meteor.startup(function(){
    $("#new-todo-input").focus();
    var list = ["#todos", "#doings", "#dones"];

    function connectWith(currentElement){
      var new_list = $.map(list, function(element, index){ if (element != currentElement) return element; });
      return new_list.join();
    };
      
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
        },
        stop: function(event, ui) {
          var _ul_parent = ui.item.parent() ,
            _id = _ul_parent.attr("id"),
            _state = _id.substring(0,_id.length-1);
            // delete the copy created by sortable plugin.
            $("#"+_id).find("li[data-state!="+_state+"]").remove();
        },
      }; // finish options

      $(list[i]).sortable(options);
    
    };

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