"use strict"
//pubsup pattern
let events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
    emit: function (eventName, data) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(function(fn) {
          fn(data);
        });
      }
    }
  };

//styling and animations
const styles = (function(){
  //sidebar transition
  let isSidebarOpen = true;
  function sidebarAnimation() {
    if(isSidebarOpen){
      document.getElementById("sidebar").style.width = "15%";
      document.getElementById("right-side").style.marginLeft = "15%";
      isSidebarOpen = !isSidebarOpen
    } else {
      document.getElementById("sidebar").style.width = "0";
      document.getElementById("right-side").style.marginLeft= "0";
      isSidebarOpen = !isSidebarOpen
    }
  }


  return {
    sidebarAnimation
  }
})()


//todo controller module
  //handle DOM
  //display changes

const todoController = (function() {
  //cashe DOM
  const openSidebarBtn = document.getElementById('hide-sidebar-button');
  const addNewTodoBtn =  document.getElementById('save-task-button');

  //bind events
  openSidebarBtn.addEventListener('click', styles.sidebarAnimation);
  document.getElementById('add-task-button').addEventListener('click', displayForm);

  function displayForm() {
    //cashe DOM
    const newTodoInput = document.getElementById('new-todo-input-container');
    let titleInput = document.getElementById('task-name');

    newTodoInput.style.display = 'flex';

    /*Bind events*/

    //check if user has input data
    titleInput.addEventListener('keyup', () => {
      if (titleInput.value == null || titleInput.value == "") {
        addNewTodoBtn.style.opacity = "0.5";
        addNewTodoBtn.style.cursor = 'not-allowed';
      }
      else {
        addNewTodoBtn.style.opacity = "1";
        addNewTodoBtn.style.cursor = 'pointer';
      }
    })
  
    addNewTodoBtn.addEventListener('click', addNewTodo);

    //add new todo function
    function addNewTodo() {
      let title = document.getElementById('task-name').value;
      let descreption = document.getElementById('task-descreption').value;
      let dueDate = document.getElementById('due-date-input').value;
      let category = document.getElementById('category').value;
    
      events.emit('create ToDo', [title, descreption, dueDate, category])
    }
    
  }
})()


//ToDos module
  //create todo
  //update local storage
  //remove a todo
  //

const toDosHandler = (function() {
  let todos = [];
  events.on('create ToDo', createToDo);

  //create a new todo
  function createToDo(data) {
    //set unique id
    const id = new Date().getTime();
    todos.push({
      id: id,
      title: data[0],
      descreption: data[1],
      dueDate: data[2],
      category: data[3]
    });
    saveTodo()
  }

  //save todo in local storage
  function saveTodo() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
})()