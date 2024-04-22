  "use strict"
  //pubsup pattern
  let events = {
    events: {},
    on: function (eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
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

    //create element in todos container helper function
    function createTodoElement(el, content, className) {
      const element = document.createElement(el);
      element.textContent = content;
      element.setAttribute('class', className);

      return element
    }

    //create input element helper function
    function createInput(type, id, placeholder) {
      const input = document.createElement('input');
      input.setAttribute('type', type);
      input.id = id;
      if(type == 'text') {
        input.setAttribute('placeholder', placeholder);
      } else if (type == 'datetime-local') {
        //input.setAttribute('class', 'hover-effect');
      }

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
        case 'reminder':
          iconEl.src = './icons/riminder.svg';
          break;
        case 'remove':
          iconEl.src = './icons/remove-icon.svg';
          iconEl.setAttribute('class', 'hover-effect');
          break;
      }

      return iconEl
    }

    //create due-date button
    function createDateBtn(type, date, btn) {
      let formatedDate = new Date(date)
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let hours = formatedDate.getHours();
      let minutes = formatedDate.getMinutes();
      let formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    
      btn.textContent = formatedDate.getDate() + ' ' + months[formatedDate.getMonth()] + ' ' + formattedTime;

      btn.appendChild(createIcon(type))
    }

    function hoverEffect(card, button) {
      //if the card is hovered we show the edit button
      card.addEventListener('mouseover', () => {
        button.style.display = 'inline-block'
      });
      card.addEventListener('mouseleave', () => {
        button.style.display = 'none';
      });
    }
 
    return {
      sidebarAnimation: sidebarAnimation,
      createTodoElement: createTodoElement,
      createInput: createInput,
      createIcon: createIcon,
      createDateBtn: createDateBtn,
      hoverEffect: hoverEffect
    }
  })();

  const mainScreen = document.getElementById('main-screen');
  const categoriesScreen = document.getElementById('category-screen');
  const sortWindow = document.getElementById('sort-container')
  const completedScreen = document.getElementById('completed-screen');

  const categoriesSidebarBtn = document.getElementById('categories-button');
  const upcomingSidebarBtn = document.getElementById('upcoming-button');
  const sortSidebarBtn = document.getElementById('sort-sidebar-button');
  const completedSidebarBtn = document.getElementById('completed-sidebar-button');

  upcomingSidebarBtn.addEventListener('click', () => events.emit('showUpcomingScreen'));
  categoriesSidebarBtn.addEventListener('click', () => events.emit('showCategoriesScreen'));
  sortSidebarBtn.addEventListener('click', () => events.emit('showSortWindow'))
  completedSidebarBtn.addEventListener('click', () => events.emit('showCompletedScreen'));

  //todo controller module
    //handle DOM
    //display changes

  const todoController = (function() {
    //cashe DOM
    const openSidebarBtn = document.getElementById('hide-sidebar-button');
    const toDoContainer = document.getElementById('to-do-container');
    const addNewTaskBtn = document.getElementById('add-task-button');

    //bind events
    openSidebarBtn.addEventListener('click', styles.sidebarAnimation);

    //add task buttons
    addNewTaskBtn.addEventListener('click', () => {
      if(document.getElementById('new-todo-input-container') == null) {
        addNewTaskBtn.insertAdjacentElement('beforebegin', createForm('newTodo'));
      }
    }, {once:true});

    document.getElementById('side-bar-add-new-task').addEventListener('click', () => {
      //if we are in another screen and add new task is clicked we show the Upcoming screen
      if(mainScreen.style.display == 'none') events.emit('showUpcomingScreen');

      if(document.getElementById('new-todo-input-container') == null) {
        addNewTaskBtn.insertAdjacentElement('beforebegin', createForm('newTodo'));
      }
    }, {once:true});

    events.on('showUpcomingScreen', showUpcomingScreen);
    events.on('renderTodos', renderTodos);
    events.on('displayTodo', displayToDos);

    //if we are in another screen and upcoming button is clicked we display the upcoming screen
    function showUpcomingScreen() {
      categoriesScreen.style.display = 'none';
      completedScreen.style.display = 'none';

      mainScreen.style.display = 'flex';
    }

    //attach event listener to the add new todo buttons
    function addNewTaskEventListener() {
      if(document.getElementById('new-todo-input-container') == null) {
        addNewTaskBtn.insertAdjacentElement('beforebegin', createForm('newTodo'));
      }
    }

    //Create new to-do Input Form
    function createForm(type) {

      const formContainer = document.createElement('div');
      formContainer.setAttribute('class', 'new-todo-input-container');
      formContainer.id = 'new-todo-input-container';

      const title = styles.createInput('text', 'task-name', 'Task name');
      formContainer.appendChild(title);

      const descreption = styles.createInput('text', 'task-descreption', 'Descreption');
      formContainer.appendChild(descreption);

      const btnContainer = document.createElement('div');
      btnContainer.setAttribute('class', 'button-container');

      const dueDate = styles.createInput('datetime-local', 'due-date-input');
      btnContainer.appendChild(dueDate);

      //Select Input
      const selectInput = styles.createTodoElement('select', '', '');
      selectInput.id = 'category';

      const option = document.createElement('option');
      option.setAttribute('class', 'select-category');
      option.setAttribute('value', '');
      option.textContent = 'Select Category';

      selectInput.appendChild(option);
      
      //add saved categories form the categoriesHandler to the select option
      events.emit('getCategories', selectInput);

      btnContainer.appendChild(selectInput);
      
      const reminderBtn = styles.createTodoElement('button', 'Reminder:', 'reminder-button');
      const reminderInput = styles.createInput('datetime-local', 'reminder-input', '');
      reminderBtn.appendChild(reminderInput);

      btnContainer.appendChild(reminderBtn);
      formContainer.appendChild(btnContainer);

      const saveCancelBtnContainer = styles.createTodoElement('div', '', 'save-cancel-button-container');
      const cancelBtn = styles.createTodoElement('button', 'Cancel', 'cancel-button hover-effect');
      cancelBtn.id = 'cancel-button';
      saveCancelBtnContainer.appendChild(cancelBtn);

      const saveBtn = styles.createTodoElement('button', 'Add Task', 'save-task-button');
      saveBtn.id = 'save-task-button';
      saveCancelBtnContainer.appendChild(saveBtn);
      formContainer.appendChild(saveCancelBtnContainer);

      //Bind Events

      //We add event listeners to the cancel and Add-newtodo button
      if(type == 'newTodo') {
        //Cancel Button
        cancelBtn.addEventListener('click', () => {
          //remove the form
          formContainer.remove();
          addNewTaskBtn.addEventListener('click', addNewTaskEventListener, {once:true});

          document.getElementById('side-bar-add-new-task').addEventListener('click', () => {
            //if we are in another screen and add new task is clicked we show the Upcoming screen
            if(mainScreen.style.display == 'none') events.emit('showUpcomingScreen');
            
            addNewTaskEventListener()
          }, {once:true});
        });

        //check if user has input data
        title.addEventListener('keyup', () => {
          if (title.value == null || title.value == '') {
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
          } else {
            saveBtn.style.opacity = "1";
            saveBtn.style.cursor = 'pointer';
            //if user has input data we create a new to-do
            saveBtn.addEventListener('click', addNewTodo);
          }
        });
      }

      //add new todo function
      function addNewTodo() {
        if(title.value != '') {
          //sent the form data to the todoHandler  module
          events.emit('create ToDo', [title.value, descreption.value, dueDate.value, selectInput.value, reminderInput.value]);        
        }
        //reset form
        resetForm();
      }

      //if edit form is displayed we remove it
      if (document.getElementById('new-todo-input-container') != null) {
        document.getElementById('new-todo-input-container').remove();
        //display todo that was removed in oreder to display the edit form
        events.emit('showTask');
      }

      //reset form
      function resetForm() {
        title.value = '';
        descreption.value = '';
        dueDate.value = '';
        selectInput.value = '';
        reminderInput.value = '';
      
        saveBtn.style.opacity = "0.5";
        saveBtn.style.cursor = 'not-allowed';
      }

      //we return the form closure
      return formContainer
    }

    //add event listener to each edit button
    function addEditEL(todo, element) {
      element.querySelector('.edit-button').addEventListener('click', edit)

      function edit() {

        //display todo that was removed in oreder to display the edit form
        events.on('showTask', () => {
          element.style.display = 'flex';
        });
        
        //display edit form
        const form = createForm('edit');
        element.insertAdjacentElement('afterend', form);

        //cashe DOM
        const title = document.getElementById('task-name');
        const descreption = document.getElementById('task-descreption');
        const dueDate = document.getElementById('due-date-input');
        const category = document.getElementById('category');
        const reminder = document.getElementById('reminder-input')
        const saveBtn = document.getElementById('save-task-button');
        const cancelBtn = document.getElementById('cancel-button');

        //hide the todo we want to edit
        element.style.display = 'none';

        //fill the edit form with the current todo data
        title.value = todo.title;
        descreption.value = todo.descreption;
        dueDate.value = todo.dueDate;
        category.value = todo.category;
        reminder.value = todo.reminder

        //style the save button
        saveBtn.style.opacity = "1";
        saveBtn.textContent = 'Save';
        saveBtn.style.cursor = 'pointer';

        //add event listener to the cancel button
        cancelBtn.addEventListener('click', () => {
          form.remove();
          element.style.display = 'flex';
        });

        //add event listener to the save button
        saveBtn.addEventListener('click', submitEdit);

        title.addEventListener('keyup', () => {
          if (title.value == null || title.value == '') {
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
            saveBtn.removeEventListener('click', submitEdit);
          }
          else {
            saveBtn.style.opacity = "1";
            saveBtn.style.cursor = 'pointer';
            //if user has input data we create a new to-do
            saveBtn.addEventListener('click', submitEdit);
          }
        });

        //submit the edit todo
        function submitEdit() {
          //we sent the edited todo data in todoHandler module
          events.emit('submitEdit', [todo.id, title.value, descreption.value, dueDate.value, category.value, reminder.value]);
          form.remove()
        }

        //add event listeners to the task buttons
        addNewTaskBtn.addEventListener('click', () => {
          addNewTaskBtn.insertAdjacentElement('beforebegin', createForm('newTodo'));
        }, {once:true});

        document.getElementById('side-bar-add-new-task').addEventListener('click', () => {
          //if we are in another screen and add new task is clicked we show the Upcoming screen
          if(mainScreen.style.display == 'none') events.emit('showUpcomingScreen');

          addNewTaskBtn.insertAdjacentElement('beforebegin', createForm('newTodo'));

        }, {once:true});
      }
    }

    //render the todos after we handle them at the todoHandler module
    function renderTodos(todos) {
      toDoContainer.textContent = '';
      todos.forEach(todo => displayToDos(todo));
    }

    //create the todoCard and display it to the upcoming screem
    function displayToDos(todo) {
      const todoCard = document.createElement('div');
      todoCard.setAttribute('class', 'to-do-card');
      todoCard.id = todo.id;

      //To-Do Left Side
      const todoLeftSide = document.createElement('div');
      todoLeftSide.setAttribute('class', 'to-do-left-side');
      todoCard.appendChild(todoLeftSide);

      const completedCheckbox = styles.createInput('checkbox', 'isCompleted');
      completedCheckbox.addEventListener('click', () => {
        //confetti effect if the todo is completed
        confetti();
        //350ms later we remove the todo card
        setTimeout(() => events.emit('completedTask', todo), 350)
      });
      todoLeftSide.appendChild(completedCheckbox);

      //To-Do Right Side
      const todoRightSide = document.createElement('div');
      todoRightSide.setAttribute('class', 'to-do-right-side');
      todoCard.appendChild(todoRightSide);
      todoRightSide.appendChild(styles.createTodoElement('h3', todo.title, 'to-do-title'));

      //edit button
      const editButton = todoRightSide.appendChild(styles.createIcon('edit'));
      editButton.id = todo.id;
      editButton.style.display = 'none';
      
      //attach event lister for each edit button
      addEditEL(todo, todoCard);
      styles.hoverEffect(todoCard, editButton);
      
      todoRightSide.appendChild(styles.createTodoElement('p', todo.descreption, 'to-do-description'));

      //Right Side button container
      const btnContainer = document.createElement('div');
      btnContainer.setAttribute('class', 'button-container');
      todoRightSide.appendChild(btnContainer);

      //create buttons

      //dueDate button
      if(todo.dueDate != '') {
        const dueDateBtn = btnContainer.appendChild(styles.createTodoElement('button', '', 'calendar-button hover-effect'));
        styles.createDateBtn('due-date', todo.dueDate, dueDateBtn);
      }

      //category
      if(todo.category != '') {
        btnContainer.appendChild(styles.createTodoElement('div', `Type: ${todo.category}`, 'to-do-category'))
      }

      //reminder button
      if(todo.reminder != '') {
        const reminderBtn = btnContainer.appendChild(styles.createTodoElement('button', '', 'calendar-button hover-effect'))
        styles.createDateBtn('reminder', todo.reminder, reminderBtn);
      }

      //insert Todo to the todo container
      toDoContainer.insertAdjacentElement('afterbegin', todoCard);
    }

  })();

  const categoryController = (function() {

    //cashe DOM
    const addCategoryBtn = document.getElementById('add-category-button');
    const categoriesContainer = document.getElementById('categories-container')

    //bind events
    events.on('showCategoriesScreen', showCategoriesScreen);
    events.on('renderCategories', renderCategories);
    addCategoryBtn.addEventListener('click', displayAddCategoryForm, {once:true});

    //show categories screen
    function showCategoriesScreen() {
      mainScreen.style.display = 'none';
      completedScreen.style.display = 'none';

      categoriesScreen.style.display = 'flex';
    }

    //display form to add new categories
    function displayAddCategoryForm() {
      const addCategoryForm = document.createElement('div');
      addCategoryForm.setAttribute('class', 'new-category-input-container');

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

      //add event listener to the cancel and save button
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

      //sent the new category to the categoriesHandler module
      function addCategory() {
        if(categoryNameInput.value != '') {
          events.emit('createCategory', categoryNameInput.value);   
          
          //reset form
          categoryNameInput.value = '';
        }
      }
      
      addCategoryBtn.insertAdjacentElement('beforebegin', addCategoryForm);
    }

    //render categories after handle them in categoriesHandler module
    function renderCategories(categories) {
      categoriesContainer.textContent = '';
      categories.forEach(category => displayCategory(category));
    }

    //display the categories
    function displayCategory(category) {
      const categoryCard = document.createElement('div')
      categoryCard.setAttribute('class', 'category-card');

      const categoryName = document.createElement('div');
      categoryName.textContent = category.name;
      categoryName.setAttribute('class', 'category-name');
      categoryCard.appendChild(categoryName);

      const removeCategoryBtn = document.createElement('img');
      removeCategoryBtn.src = './icons/remove-icon.svg';
      removeCategoryBtn.setAttribute('class', 'hover-effect');
      removeCategoryBtn.style.display = 'none';
      removeCategoryBtn.id = category.id;
      categoryCard.appendChild(removeCategoryBtn);

      //atach eventListener to the remove button
      removeCategoryBtn.addEventListener('click', (event) => {
        const deleteBtn = event.target;
        const idToDelete = deleteBtn.id;

        //sent to the categoriesHandler module the id of the category we wnat to delete
        events.emit('deleteCategory', idToDelete);
      });
      styles.hoverEffect(categoryCard, removeCategoryBtn);

      //inster the category to the categories screen
      categoriesContainer.insertAdjacentElement('afterbegin', categoryCard);
    }

  })();

  const sortController = (function() {
    //show sort window
    function showSortWindow() {
      sortWindow.style.display = 'block';
      document.addEventListener('click', (event) => {
        let isClickedInside = (sortWindow.contains(event.target) || sortSidebarBtn.contains(event.target))
        if(!isClickedInside) sortWindow.style.display = 'none';
      });

      if(sortWindow.style.display == 'block') {
        applyBtn.addEventListener('click', applySort);
      }
    }

    //cashe DOM
    const sortOptions = document.querySelectorAll('.sort-option');
    const orderOptions = document.querySelectorAll('.order-option');
    const applyBtn = document.getElementById('apply-button')

    //bind events

    events.on('showSortWindow', showSortWindow);

    //add event listener to each sort opion
    sortOptions.forEach((option) => {
      option.addEventListener('click', () => {
        selectOption(sortOptions, option);
      });
    });

    //add event listener to each order opion
    orderOptions.forEach(option => {
      option.addEventListener('click', () => selectOption(orderOptions, option));
    });

    //we display the check icon at the option we click
    function selectOption(type, option) {
      //uncheck selected options
      type.forEach(op => {
        if(op != option) {
          op.querySelector('img').style.display = 'none';
          op.dataset.selected = 'false';
        } else op.dataset.selected = 'true';
      });

      //check the clicked option
      option.querySelector('img').style.display = 'block';
    }

    //apply sort sending the filters at sortHandler module
    function applySort() {
      let sortBy;
      let order;

      //take the selected options and we sent the to the sortHandler module in orerder to sort the todos
      sortOptions.forEach(option => {
        if(option.dataset.selected == 'true') sortBy = option.dataset.type
      })
      orderOptions.forEach(option => {
        if(option.dataset.selected == 'true') order = option.dataset.order
      });

      events.emit('sortTodos', [sortBy, order]);
      sortWindow.style.display = 'none';
    }
  })();

  const completedController = (function() {

    //show completed screen
    function showCompletedScreen() {
      mainScreen.style.display = 'none';
      categoriesScreen.style.display = 'none';
      
      completedScreen.style.display = 'flex';
    }

    //cashe DOM
    const completedContainer = document.getElementById('completed-container');

    //Bind events
    events.on('showCompletedScreen', showCompletedScreen);
    events.on('renderCompletedTodos', renderCompletedTodos);

    //render the completed todos
    function renderCompletedTodos(completedTodos) {
      completedContainer.textContent = '';

      if(completedTodos.length ==0) {
        completedContainer.appendChild(styles.createTodoElement('div', 'No completed to-dos here!', ''))
      }
      completedTodos.forEach(completedTodo => displayCompletedTodos(completedTodo));
    }

    //create card for each completed todo
    function displayCompletedTodos(completedTodo) {
      const completedTodoCard = document.createElement('div');
      completedTodoCard.setAttribute('class', 'completed-todo-card');

      const cardHeader = styles.createTodoElement('div', '', 'completed-header');
      completedTodoCard.appendChild(cardHeader);

      cardHeader.appendChild(styles.createTodoElement('h3', completedTodo.title, 'to-do-title'));

      //remove button
      const removeBtn = cardHeader.appendChild(styles.createIcon('remove'));
      removeBtn.id = completedTodo.id;
      removeBtn.style.display = 'none';

      //atach eventListener
      removeBtn.addEventListener('click', (event) => {
        const deleteBtn = event.target;
        const idToDelete = deleteBtn.id;

        events.emit('deleteCompletedTodo', idToDelete);
      });
      styles.hoverEffect(completedTodoCard, removeBtn);

      completedTodoCard.appendChild(styles.createTodoElement('p', completedTodo.descreption, 'to-do-description'));

      const btnContainer = document.createElement('div');
      btnContainer.setAttribute('class', 'button-container');
      completedTodoCard.appendChild(btnContainer);

      //create buttons

      //dueDate button
      if(completedTodo.dueDate != '') {
        const dueDateBtn = btnContainer.appendChild(styles.createTodoElement('button', '', 'calendar-button hover-effect'));
        styles.createDateBtn('due-date', completedTodo.dueDate, dueDateBtn);
      }

      //category
      if(completedTodo.category != '') {
        btnContainer.appendChild(styles.createTodoElement('div', `Type: ${completedTodo.category}`, 'to-do-category'))
      }

      //reminder
      if(completedTodo.reminder != '') {
        const reminderBtn = btnContainer.appendChild(styles.createTodoElement('button', '', 'calendar-button hover-effect'))
        styles.createDateBtn('reminder', completedTodo.reminder, reminderBtn);
      }

      //insert completed Todo
      completedContainer.insertAdjacentElement('afterbegin', completedTodoCard);

    }
  })();

  //ToDos module
    //create todo
    //update local storage
    //remove a todo
    //set reminder to the todos

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
    events.on('submitEdit', editTodo);
    events.on('deleteTodo', deleteTodo);
    
    //create a new todo
    function createToDo(data) {
      //set unique id
      const id = new Date().getTime();
      todos.push({
        id: id,
        title: data[0],
        descreption: data[1],
        dueDate: data[2],
        category: data[3],
        reminder: data[4]
      });

      //check if the todo has a reminder
      if(data[4] != '') {
        setReminder({
          id: id,
          title: data[0],
          descreption: data[1],
          dueDate: data[2],
          category: data[3],
          reminder: data[4]
        });
      };

      saveTodo();
      //sent the todos to the todosController to render them
      events.emit('renderTodos', todos);
    }

    //edit todo
    function editTodo(data) {
      //find the todo we want to edit
      let todoToEdit = todos.filter(todo => todo.id === data[0])[0];

      let i = 1;
      //check the methods that we want to edit and we change them with the new ones
      for (const key in todoToEdit) {
        if (key === 'id')continue
        if (todoToEdit[key] !== data[i] && data[i] !== '') {
          todoToEdit[key] = data[i];
          if(key === 'reminder') setReminder(todoToEdit);
        }
        i++
      }

      //replace the todo with the edited todo
      for(let todo of todos) {
        if(todo.id === todoToEdit.id) todo = todoToEdit
      }

      saveTodo();
      //sent the todos to the todosController to render them
      events.emit('renderTodos', todos);
    }

    //delete the todo
    function deleteTodo(idToDelete) {
      todos = todos.filter((todo) => {
        if(todo.id == idToDelete) {
          return false;
        } else return true;
      });

      saveTodo();
      //sent the todos to the todosController to render them
      events.emit('renderTodos', todos);
    }

    //set reminder 
    function setReminder(todo) {
      const now = new Date();
      const reminderTime = new Date(todo.reminder);
      const remainingTime = reminderTime - now;

      //if remainingTime is negative,the notification has passed
      if (remainingTime <= 0) {
        console.error("The notification has passed!");
        return;
      }

      setTimeout(function () {
        notify(todo);
      }, remainingTime);
    }

    function notify(todo) {
      //check if Notification API is supported
      if (!("Notification" in window)) {
        console.error(
          "Browser does not support desktop notifications"
        );
        return;
      }

      if (Notification.permission === "granted") {
        //display notification
        new Notification("Reminder", {
          body: `Todo item "${todo.title}" is due now!`,
        });
      } else if (Notification.permission !== "denied") {
        // Ask for permision and then we display the notification
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            alert(`Todo item "${todo.title}" is due now!`)
            new Notification("Reminder", {
              body: `Todo item "${todo.title}" is due now!`,
            });
          }
        });
      }
      //if permision is denied we don't do anything
    }

    //save todo in local storage
    function saveTodo() {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  })();

  //categories module
    //create new categories
    //remove categories
  const categoriesHandler = (function() {
    let categories;

    //we check if we have saved categories else we have some default categories
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

    //sent the categories when we display the form for new or edit todo
    events.on('getCategories', (parent) => {
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.setAttribute('class', 'select-category');
        option.setAttribute('value', category.name);
        option.textContent = category.name;

        parent.appendChild(option);
      })
    });

    events.emit('renderCategories', categories);

    //create new category
    function createCategory(category) {
      const id = new Date().getTime();
      categories.push({
        id: id,
        name: category
      });
      saveCategory();
      events.emit('renderCategories', categories);
    }

    //delete category
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

  //sort todos module
  //sort the todos by name, due-daye,category or manualy in ascending or descending order
  const sortHandler = (function() {
    events.on('sortTodos', sortTodos);

    function sortTodos(filters) {
      let sortedTodos = [];

      //get the saved todos
      const savedTodos = JSON.parse(localStorage.getItem('todos'));
      if(Array.isArray(savedTodos)) {
        sortedTodos = savedTodos;
      }

      //sort the todos
      switch (filters[0]) {
        case 'manual':
          sortedTodos = savedTodos;
          break;
        case 'name' || 'category':
          sortedTodos = sortedTodos.sort((a, b) => {
            if(filters[0] == 'name') {
              var todoA = a.title.toLowerCase();
              var todoB = b.title.toLowerCase();
            } else {
              var todoA = a.category.toLowerCase();
              var todoB = b.category.toLowerCase();
            }

            if(todoA < todoB) return 1;
            if(todoA > todoB) return -1;
            return 0;
          });
          break;
        case 'dueDate':
          sortedTodos = sortedTodos.sort((a,b) => {
            let dateA = new Date(a.dueDate);
            let dateB = new Date(b.dueDate);
  
            return dateA - dateB;
          });
          break;

      }
      
      //change the order in ascending or descending
      switch (filters[1]) {
        case 'ascending':
          sortedTodos = savedTodos;
          break;
        case 'descending':
          if(filters[0] == 'manual') {
            sortedTodos = savedTodos.reverse();
          } else {
            sortedTodos = sortedTodos.reverse();
          }
          break;
      }
      events.emit('showUpcomingScreen');
      events.emit('renderTodos', sortedTodos);
    }
  })();

  //completed todos module

  const completedHAndler = (function() {
    let completedTodos = [];

    //check if we have completed todos saved
    const savedcompletedTodos = JSON.parse(localStorage.getItem('completedTodos'));
    if(Array.isArray(savedcompletedTodos)) {
      completedTodos = savedcompletedTodos;
    }

    //bind events
    events.on('completedTask', completedTask);
    events.on('deleteCompletedTodo', deleteCompletedTodo);
    //render the completed todos
    events.emit('renderCompletedTodos', completedTodos);

    function completedTask(completedTodo) {
      completedTodos.push(completedTodo);

      //remove To-do from Upcoming screen
      events.emit('deleteTodo', completedTodo.id);
      
      saveCompleted();
      //render the completed todos
      events.emit('renderCompletedTodos', completedTodos);
    }

    //delete completed todo
    function deleteCompletedTodo(idToDelete) {
      completedTodos = completedTodos.filter((completedTodo) => {
        if(completedTodo.id == idToDelete) {
          return false;
        } else return true;
      });

      saveCompleted();
      //render the completed todos
      events.emit('renderCompletedTodos', completedTodos);
    }

    function saveCompleted() {
      localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
    }
  })();