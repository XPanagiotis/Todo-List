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

const mainScreen = document.getElementById('main-screen');
const categoriesScreen = document.getElementById('category-screen');
const sortScreen = document.getElementById('sort-screen');

const categoriesSidebarBtn = document.getElementById('categories-button');
const upcomingSidebarBtn = document.getElementById('upcoming-button');
const sortSidebarBtn = document.getElementById('sort-sidebar-button');

upcomingSidebarBtn.addEventListener('click', () => events.emit('showUpcomingScreen'));
categoriesSidebarBtn.addEventListener('click', () => events.emit('showCategoriesScreen'));
sortSidebarBtn.addEventListener('click', () => events.emit('showSortScreen'));

//todo controller module
  //handle DOM
  //display changes

const todoController = (function() {
  //cashe DOM
  const openSidebarBtn = document.getElementById('hide-sidebar-button');

  const toDoContainer = document.getElementById('to-do-container');
  const newTodoInput = document.getElementById('new-todo-input-container');

  const submitBtn =  document.getElementById('save-task-button');
  const cancelBtn = document.getElementById('cancel-button');

  const addNewTaskBtn = document.getElementById('add-task-button');


  //form
  const title = document.getElementById('task-name');
  const descreption = document.getElementById('task-descreption');
  const dueDate = document.getElementById('due-date-input');
  const category = document.getElementById('category');

  //bind events
  openSidebarBtn.addEventListener('click', styles.sidebarAnimation);
  addNewTaskBtn.addEventListener('click', displayForm);
  document.getElementById('side-bar-add-new-task').addEventListener('click', displayForm);

  events.on('showUpcomingScreen', showUpcomingScreen);
  events.on('renderTodos', renderTodos);
  events.on('displayTodo', displayToDos);

  function showUpcomingScreen() {
    categoriesScreen.style.display = 'none';
    sortScreen.style.display = 'none';

    mainScreen.style.display = 'flex';
  }



  function displayForm() {
    //if we are in another screen and add new task is clicked we show the upcoming screen
    if(mainScreen.style.display == 'none') events.emit('showUpcomingScreen');

    //if edit form is displayed we remove it and reset it
    if (newTodoInput.style.display == 'flex') {
      newTodoInput.style.display = 'none';
      resetForm()
      events.emit('showTask');
    }
    
    //display the form
    document.getElementById('add-task-button').insertAdjacentElement('beforebegin', newTodoInput);
    newTodoInput.style.display = 'flex';
    submitBtn.textContent = 'Add Task';

    /*Bind events*/
    cancelBtn.addEventListener('click', cancelForm);

    //check if user has input data
    title.addEventListener('keyup', () => {
      if (title.value == null || title.value == '') {
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.removeEventListener('click', addNewTodo);
      }
      else {
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = 'pointer';
        //if user has input data we create a new to-do
        submitBtn.addEventListener('click', addNewTodo);
      }
    })

    //add new todo function
    function addNewTodo() {
      if(title.value != '') {
        events.emit('create ToDo', [title.value, descreption.value, dueDate.value, category.value]);        
      }
      //reset form
      resetForm();
    }

    function cancelForm() {
      newTodoInput.style.display = 'none';
      resetForm();
      cancelBtn.removeEventListener('click', cancelForm);
    }

    //reset form
    function resetForm() {
      submitBtn.removeEventListener('click', addNewTodo);

      title.value = '';
      descreption.value = '';
      dueDate.value = '';
      category.value = '';

      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = 'not-allowed';
    }

    return {
      cancelForm,
      resetForm
    }
  }

  function addEditEL(todo, element) {
    element.querySelector('.edit-button').addEventListener('click', _edit)


    function _edit() {

      events.on('showTask', () => {
        element.style.display = 'flex';
      })



      //if another edit button is clicked we display all the todos
      let cards = document.querySelectorAll('.to-do-card');
      cards.forEach(card => {
        if(card.style.display == 'none') {
          card.style.display = 'flex';

        }
      });

      //display edit form
      const form = element.insertAdjacentElement('afterend', newTodoInput);

      console.log(form)
      //hide the todo we want to edit
      element.style.display = 'none';

      //fill the edit form with the current todo data
      title.value = todo.title;
      descreption.value = todo.descreption;
      dueDate.value = todo.dueDate;
      category.value = todo.category;

      //style the save button
      submitBtn.style.opacity = "1";
      submitBtn.textContent = 'Save';
      submitBtn.style.cursor = 'pointer';

      //Bind events
      cancelBtn.addEventListener('click', cancelEdit, {once:true});
      submitBtn.addEventListener('click', submitEdit, {once:true});

      title.addEventListener('keyup', () => {
        if (title.value == null || title.value == '') {
          submitBtn.style.opacity = '0.5';
          submitBtn.style.cursor = 'not-allowed';
          submitBtn.removeEventListener('click', editTodo);
        }
        else {
          submitBtn.style.opacity = "1";
          submitBtn.style.cursor = 'pointer';
          //if user has input data we create a new to-do
        }
      });

      //if the cancel button is clicked we remove and reset the form and remove the enevtListener
      function cancelEdit() {
        element.style.display = 'flex';

        title.value = '';
        descreption.value = '';
        dueDate.value = '';
        category.value = '';

        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = 'not-allowed';

        form.style.display = 'none';
        cancelBtn.removeEventListener('click', cancelEdit);
      }

      //edit todo
      function submitEdit() {
        events.emit('submitEdit', [todo.id, title.value, descreption.value, dueDate.value, category.value]);
        title.value = '';
        descreption.value = '';
        dueDate.value = '';
        category.value = '';

        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = 'not-allowed';

        submitBtn.removeEventListener('click', submitEdit)
      }

      //submitBtn.addEventListener('click', editTodo);
      newTodoInput.style.display = 'flex';
    }
    
  }

  function renderTodos(todos) {
    toDoContainer.textContent = '';
    todos.forEach(todo => displayToDos(todo));
  }

  function displayToDos(todo) {
    const todoCard = document.createElement('div');
    todoCard.setAttribute('class', 'to-do-card');
    todoCard.id = todo.id;

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
    const editButton = todoRightSide.appendChild(createIcon('edit'));
    editButton.id = todo.id
    
    //attach event lister for each edit button
    addEditEL(todo, todoCard);
    
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

    //category 
    btnContainer.appendChild(createTodoElement('div', `Type: ${todo.category}`, 'to-do-category'))

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
        iconEl.src = './icons/edit.svg';
        iconEl.setAttribute('class', 'edit-button hover-effect')
        break;
     }

     return iconEl
  }


})();

const categoryController = (function() {

  //cashe DOM
  const addCategoryBtn = document.getElementById('add-category-button');
  const categoriesContainer = document.getElementById('categories-container')

  //bind events
  events.on('showCategoriesScreen', showCategoriesScreen);
  addCategoryBtn.addEventListener('click', displayAddCategoryForm, {once:true});
  events.on('renderCategories', renderCategories)

  function showCategoriesScreen() {
    mainScreen.style.display = 'none';
    sortScreen.style.display = 'none';

    categoriesScreen.style.display = 'flex';
  }

  function displayAddCategoryForm() {
    const addCategoryForm = document.createElement('div');
    addCategoryForm.setAttribute('class', 'new-category-input-container');
    addCategoryForm.style.display = 'flex';

    const categoryNameInput = document.createElement('input');
    categoryNameInput.id = 'category-name-input';
    categoryNameInput.setAttribute('placeholder', 'Category Name');

    addCategoryForm.appendChild(categoryNameInput);

    const dtnContainer = document.createElement('div');
    dtnContainer.setAttribute('class', 'save-cancel-button-container');
    addCategoryForm.appendChild(dtnContainer)
    
    const cancelBtn = document.createElement('button');
    cancelBtn.setAttribute('class', 'cancel-button hover-effect');
    cancelBtn.textContent = 'Cancel'
    cancelBtn.id = 'cancel-category-button';

    dtnContainer.appendChild(cancelBtn);

    const saveBtn = document.createElement('button');
    saveBtn.setAttribute('class', 'save-task-button');
    saveBtn.textContent = 'Save'
    saveBtn.id = 'save-category-button';

    dtnContainer.appendChild(saveBtn);

    //bind events
    cancelBtn.addEventListener('click', () => {
      addCategoryForm.remove();
      addCategoryBtn.addEventListener('click', displayAddCategoryForm, {once:true});
    });

    categoryNameInput.addEventListener('keyup', () => {
      if (categoryNameInput.value == null || categoryNameInput.value == '') {
        saveBtn.style.opacity = '0.5';
        saveBtn.style.cursor = 'not-allowed';
      }
      else {
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = 'pointer';
        //if user has input data we create a new to-do
        saveBtn.addEventListener('click', addCategory);
      }
    });

    function addCategory() {
      if(categoryNameInput.value != '') {
        events.emit('createCategory', categoryNameInput.value);   
        
        //reset form
        categoryNameInput.value = '';
      }
    }
    
    addCategoryBtn.insertAdjacentElement('beforebegin', addCategoryForm);
  }

  function renderCategories(categories) {
    categoriesContainer.textContent = '';
    categories.forEach(category => displayCategory(category));
  }

  function displayCategory(category) {
    const categoryCard = document.createElement('div')
    categoryCard.setAttribute('class', 'category-card');
    //categoryCard.id = category.id;

    const categoryName = document.createElement('div');
    categoryName.textContent = category.name;
    categoryName.setAttribute('class', 'category-name');
    categoryCard.appendChild(categoryName);

    const removeCategoryBtn = document.createElement('img');
    removeCategoryBtn.src = './icons/remove-icon.svg';
    removeCategoryBtn.setAttribute('class', 'hover-effect');
    removeCategoryBtn.id = category.id;
    categoryCard.appendChild(removeCategoryBtn);

    //atach eventListener
    removeCategoryBtn.addEventListener('click', (event) => {
      const deleteBtn = event.target
      const idToDelete = deleteBtn.id;

      events.emit('deleteCategory', idToDelete);
    })

    categoriesContainer.insertAdjacentElement('afterbegin', categoryCard);
  }

})();

const sortController = (function() {

  events.on('showSortScreen', showSortScreen)

  function showSortScreen() {
    mainScreen.style.display = 'none';
    categoriesScreen.style.display = 'none';

    sortScreen.style.display = 'flex';
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

  const savedTodos = JSON.parse(localStorage.getItem('todos'));
  if(Array.isArray(savedTodos)) {
    todos = savedTodos;
    todos.forEach(todo =>  events.emit('displayTodo', todo))
  }

  //bind events
  events.on('create ToDo', createToDo);
  events.on('submitEdit', editTodo)
  
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

  //edit todo
  function editTodo(data) {
    let todoToEdit = todos.filter(todo => todo.id === data[0])[0];

    let i = 1;
    for (const key in todoToEdit) {
      if (key === 'id')continue
      if (todoToEdit[key] !== data[i] & data[i] !== '') {
        todoToEdit[key] = data[i];
      }
      i++
    }

    for(let todo of todos) {
      if(todo.id === todoToEdit.id) todo = todoToEdit
    }
    saveTodo();
    events.emit('renderTodos', todos);
  }


  //save todo in local storage
  function saveTodo() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
})();


const categoriesHandler = (function() {
  let categories;

  const savedCategories = JSON.parse(localStorage.getItem('categories'));
  if(Array.isArray(savedCategories)) {
    categories = savedCategories;
  } else {
    categories = [{
      id: 1,
      name: 'Groceries'
    }, {
      id: 2,
      name: 'Super Market'
    }]
  }

  //bind events
  events.on('createCategory', createCategory);
  events.on('deleteCategory', deleteCategory);
  events.emit('renderCategories', categories);

  function createCategory(category) {
    const id = new Date().getTime();
    categories.push({
      id: id,
      name: category
    });
    saveCategory();
    events.emit('renderCategories', categories);
  }

  function deleteCategory(idToDelete) {
    categories = categories.filter((category) => {
      if(category.id == idToDelete) {
        return false;
      } else return true;
    });

    saveCategory();
    events.emit('renderCategories', categories);
  }

  function saveCategory() {
    localStorage.setItem('categories', JSON.stringify(categories));
  }
})();