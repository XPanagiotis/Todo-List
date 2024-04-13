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
  const toDoContainer = document.getElementById('to-do-container');
  const newTodoInput = document.getElementById('new-todo-input-container');

  //bind events
  openSidebarBtn.addEventListener('click', styles.sidebarAnimation);
  document.getElementById('add-task-button').addEventListener('click', displayForm);
  events.on('renderTodos', renderTodos);
  events.on('displayTodo', displayToDos);

  function displayForm() {
    //cashe DOM
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
        //if user has input data we create a new to-do
        addNewTodoBtn.addEventListener('click', addNewTodo);
      }
    })
  
    //add new todo function
    function addNewTodo() {
      
      let title = document.getElementById('task-name');
      let descreption = document.getElementById('task-descreption');
      let dueDate = document.getElementById('due-date-input');
      let category = document.getElementById('category');
    
      events.emit('create ToDo', [title.value, descreption.value, dueDate.value, category.value]);
      
      //clear form
      (function clearForm() {
        let title = document.getElementById('task-name');
        title.value = '';
        let descreption = document.getElementById('task-descreption');
        descreption.value = '';
        let dueDate = document.getElementById('due-date-input');
        dueDate.value = '';
        let category = document.getElementById('category');
        category.value = '';
      })()
    }

    //clear form
    function clearForm() {
      let title = document.getElementById('task-name');
      title.value = '';
      let descreption = document.getElementById('task-descreption');
      descreption.value = '';
      let dueDate = document.getElementById('due-date-input');
      dueDate.value = '';
      let category = document.getElementById('category');
      category.value = '';
    }
  }

  function renderTodos(todos) {
    toDoContainer.textContent = '';
    todos.forEach(todo => displayToDos(todo));
  }


  function displayToDos(todo) {
    console.log(todo)
    const todoCard = document.createElement('div');
    todoCard.setAttribute('class', 'to-do-card');

    //To-Do Left Side
    const todoLeftSide = document.createElement('div');
    todoLeftSide.setAttribute('class', 'to-do-left-side');
    todoCard.appendChild(todoLeftSide);
    todoLeftSide.appendChild(createInput('checkbox', 'isCompleted'))

    //To-Do Right Side
    const todoRightSide = document.createElement('div');
    todoRightSide.setAttribute('class', 'to-do-right-side');
    todoCard.appendChild(todoRightSide);
    todoRightSide.appendChild(createTodoElement('h3', todo.title, 'to-do-title'));

    //edit button
    const editButton = todoRightSide.appendChild(createTodoElement('button', '', 'edit-button hover-effect'))
    editButton.appendChild(createIcon('edit'));
    
    todoRightSide.appendChild(createTodoElement('p', todo.descreption, 'to-do-description'));

    //Right Side button container
    const btnContainer = document.createElement('div');
    btnContainer.setAttribute('class', 'button-container');
    todoRightSide.appendChild(btnContainer);

    //create buttons

    //dueDate button
    if(todo.dueDate != '') {
      const dueDateBtn = btnContainer.appendChild(createTodoElement('button', '', 'calendar-button hover-effect'));
      let dueDate = new Date(todo.dueDate)
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
      let hours = dueDate.getHours();
      let minutes = dueDate.getMinutes();
      let formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    
      dueDateBtn.textContent = dueDate.getDate() + ' ' + months[dueDate.getMonth()] + ' ' + formattedTime;
  
      dueDateBtn.appendChild(createIcon('due-date'));
    }

    //insert Todo
    toDoContainer.insertAdjacentElement('afterbegin', todoCard);
  }

  //create element in todos container helper function
  function createTodoElement(el, content, className) {
    const element = document.createElement(el);
    element.textContent = content;
    element.setAttribute('class', className);

    return element
  }

  //create input element helper function
  function createInput(type, id) {
    const input = document.createElement('input');
    input.setAttribute('type', type);
    input.id = id;

    return input
  }

  //create icon helper function
  function createIcon(icon) {
    const iconEl = document.createElement('img');
     switch (icon) {
      case 'due-date':
        iconEl.src = './icons/calendar.svg';
        break;
      case 'edit':
        iconEl.src = './icons/edit.svg'
        break;
     }

     return iconEl
  }
})()


//ToDos module
  //create todo
  //update local storage
  //remove a todo
  //

const toDosHandler = (function() {
  //initialize todos
  let todos = [];

  const savedTodos = JSON.parse(localStorage.getItem('todos'))
  if(Array.isArray(savedTodos)) {
    todos = savedTodos;
    todos.forEach(todo =>  events.emit('displayTodo', todo))
  }

  //bind events
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

    saveTodo();
    events.emit('renderTodos', todos);
  }

  //save todo in local storage
  function saveTodo() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
})()