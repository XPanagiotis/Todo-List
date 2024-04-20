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
        input.setAttribute('class', 'hover-effect');
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
    function createDueDateBtn(todo, btn) {
      let dueDate = new Date(todo.dueDate)
      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let hours = dueDate.getHours();
      let minutes = dueDate.getMinutes();
      let formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    
      btn.textContent = dueDate.getDate() + ' ' + months[dueDate.getMonth()] + ' ' + formattedTime;

      btn.appendChild(createIcon('due-date'))
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
      createDueDateBtn: createDueDateBtn,
      hoverEffect: hoverEffect
    }
  })()

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

    function showUpcomingScreen() {
      categoriesScreen.style.display = 'none';
      completedScreen.style.display = 'none';

      mainScreen.style.display = 'flex';
    }

    //Create new to-do Input Form
    function createForm(type) {

      const formContainer = document.createElement('div');
      formContainer.setAttribute('class', 'new-todo-input-container');
      formContainer.id = 'new-todo-input-container';

      const title = styles.createInput('text', 'task-name', 'Task name')
      formContainer.appendChild(title);

      const descreption = styles.createInput('text', 'task-descreption', 'Descreption')
      formContainer.appendChild(descreption);

      const btnContainer = document.createElement('div');
      btnContainer.setAttribute('class', 'button-container');

      const dueDate = styles.createInput('datetime-local', 'due-date-input')
      btnContainer.appendChild(dueDate);

      //Select Input
      const selectInput = styles.createTodoElement('select', '', 'hover-effect');
      selectInput.id = 'category';

      const option = document.createElement('option');
      option.setAttribute('class', 'select-category');
      option.setAttribute('value', '');
      option.textContent = 'Select Category';

      selectInput.appendChild(option);
      
      //add saves categories to the select option
      events.emit('getCategories', selectInput);

      btnContainer.appendChild(selectInput);
      
      const reminderBtn = styles.createTodoElement('button', 'Reminder', 'reminder-button hover-effect');
      reminderBtn.appendChild(styles.createIcon('reminder'));

      btnContainer.appendChild(reminderBtn);
      formContainer.appendChild(btnContainer)

      const saveCancelBtnContainer = styles.createTodoElement('div', '', 'save-cancel-button-container');
      const cancelBtn = styles.createTodoElement('button', 'Cancel', 'cancel-button hover-effect');
      cancelBtn.id = 'cancel-button';
      saveCancelBtnContainer.appendChild(cancelBtn)

      const saveBtn = styles.createTodoElement('button', 'Add Task', 'save-task-button');
      saveBtn.id = 'save-task-button';
      saveCancelBtnContainer.appendChild(saveBtn);
      formContainer.appendChild(saveCancelBtnContainer);


      //Bind Events

      if(type == 'newTodo') {
        //Cancel Button
        cancelBtn.addEventListener('click', () => {
          formContainer.remove();

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
          events.emit('create ToDo', [title.value, descreption.value, dueDate.value, selectInput.value]);        
        }
        //reset form
        resetForm();
      }

      //if edit form is displayed we remove it and reset it
      if (document.getElementById('new-todo-input-container') != null) {
        document.getElementById('new-todo-input-container').remove();
        events.emit('showTask');
      }

      //reset form
      function resetForm() {
        //saveBtn.removeEventListener('click', addNewTodo);
      
        title.value = '';
        descreption.value = '';
        dueDate.value = '';
        selectInput.value = '';
      
        saveBtn.style.opacity = "0.5";
        saveBtn.style.cursor = 'not-allowed';
      }

      return formContainer
    }

    function addEditEL(todo, element) {
      
      element.querySelector('.edit-button').addEventListener('click', edit)


      function edit() {

        events.on('showTask', () => {
          element.style.display = 'flex';
        });
        
        //cashe DOM

        //display edit form
        const form = createForm('edit');
        element.insertAdjacentElement('afterend', form);

        const title = document.getElementById('task-name');
        const descreption = document.getElementById('task-descreption');
        const dueDate = document.getElementById('due-date-input');
        const category = document.getElementById('category');
        const saveBtn = document.getElementById('save-task-button');
        const cancelBtn = document.getElementById('cancel-button');

        //hide the todo we want to edit
        element.style.display = 'none';

        //fill the edit form with the current todo data
        title.value = todo.title;
        descreption.value = todo.descreption;
        dueDate.value = todo.dueDate;
        category.value = todo.category;

        //style the save button
        saveBtn.style.opacity = "1";
        saveBtn.textContent = 'Save';
        saveBtn.style.cursor = 'pointer';

        //cancel button
        cancelBtn.addEventListener('click', () => {
          form.remove();
          element.style.display = 'flex';
        });

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

        //edit todo
        function submitEdit() {
          events.emit('submitEdit', [todo.id, title.value, descreption.value, dueDate.value, category.value]);
          form.remove()
        }

        //add task buttons
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

      const completedCheckbox = styles.createInput('checkbox', 'isCompleted');
      completedCheckbox.addEventListener('click', () => {
        confetti();
        events.emit('completedTask', todo)
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
        styles.createDueDateBtn(todo, dueDateBtn);
      }

      //category
      if(todo.category != '') {
        btnContainer.appendChild(styles.createTodoElement('div', `Type: ${todo.category}`, 'to-do-category'))
      }

      //insert Todo
      toDoContainer.insertAdjacentElement('afterbegin', todoCard);
    }

  })();

  const categoryController = (function() {

    //cashe DOM
    const addCategoryBtn = document.getElementById('add-category-button');
    const categoriesContainer = document.getElementById('categories-container')

    //bind events
    events.on('showCategoriesScreen', showCategoriesScreen);
    addCategoryBtn.addEventListener('click', displayAddCategoryForm, {once:true});
    events.on('renderCategories', renderCategories);

    function showCategoriesScreen() {
      mainScreen.style.display = 'none';
      completedScreen.style.display = 'none';

      categoriesScreen.style.display = 'flex';
    }

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

      //atach eventListener
      removeCategoryBtn.addEventListener('click', (event) => {
        const deleteBtn = event.target;
        const idToDelete = deleteBtn.id;

        events.emit('deleteCategory', idToDelete);
      });
      styles.hoverEffect(categoryCard, removeCategoryBtn);

      categoriesContainer.insertAdjacentElement('afterbegin', categoryCard);
    }

  })();

  const sortController = (function() {
    const sortOptions = document.querySelectorAll('.sort-option');
    const orderOptions = document.querySelectorAll('.order-option');
    const applyBtn = document.getElementById('apply-button')

    //bind events

    //sort
    sortOptions.forEach((option) => {
      option.addEventListener('click', () => {
        selectOption(sortOptions, option);
      });
    });

    //order
    orderOptions.forEach(option => {
      option.addEventListener('click', () => selectOption(orderOptions, option));
    });

    //apply button
    applyBtn.addEventListener('click', () => {
      let sortBy;
      let order;
      sortOptions.forEach(option => {
        if(option.dataset.selected == 'true') sortBy = option.dataset.type
      })
      orderOptions.forEach(option => {
        if(option.dataset.selected == 'true') order = option.dataset.order
      })

      events.emit('sortTodos', [sortBy, order]);
      sortWindow.style.display = 'none'
    })

    events.on('showSortWindow', showSortWindow);

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

    function showSortWindow() {
      sortWindow.style.display = 'block';
    }
  })();

  const completedController = (function() {

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

    function renderCompletedTodos(completedTodos) {
      completedContainer.textContent = '';
      completedTodos.forEach(completedTodo => displayCompletedTodos(completedTodo));
    }

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
        styles.createDueDateBtn(completedTodo, dueDateBtn);
      }

      //category
      if(completedTodo.category != '') {
        btnContainer.appendChild(styles.createTodoElement('div', `Type: ${completedTodo.category}`, 'to-do-category'))
      }

      //insert Todo
      completedContainer.insertAdjacentElement('afterbegin', completedTodoCard);

    }
  })();

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

    function deleteTodo(idToDelete) {
      todos = todos.filter((todo) => {
        if(todo.id == idToDelete) {
          return false;
        } else return true;
      });

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
    events.on('getCategories', (parent) => {
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.setAttribute('class', 'select-category');
        option.setAttribute('value', category.name);
        option.textContent = category.name;

        parent.appendChild(option);
      })
    })
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

  const sortHandler = (function() {
    let sortedTodos = [];

    events.on('sortTodos', sortTodos);

    const savedTodos = JSON.parse(localStorage.getItem('todos'));
    if(Array.isArray(savedTodos)) {
      sortedTodos = savedTodos;
    }

    function sortTodos(filters) {
      switch (filters[0]) {
        case 'manual':
          sortedTodos = savedTodos;
          break;
        case 'name':
          sortedTodos = sortedTodos.sort((a, b) => {
            let titleA = a.title.toLowerCase();
            let titleB = b.title.toLowerCase();

            if(titleA < titleB) return -1
            if(titleA > titleB) return 1
            return 0
          });
          break;
          
      }
      switch (filters[1]) {
        case 'ascending':
          sortedTodos = savedTodos;
          break;
        case 'descending':
          sortedTodos = savedTodos.reverse();
          break;
      }


      events.emit('showUpcomingScreen');
      events.emit('renderTodos', sortedTodos);
      sortedTodos = []
    }
  })()

  const completedHAndler = (function() {
    let completedTodos = [];

    const savedcompletedTodos = JSON.parse(localStorage.getItem('completedTodos'));
    if(Array.isArray(savedcompletedTodos)) {
      completedTodos = savedcompletedTodos;
    }

    //bind events
    events.on('completedTask', completedTask);
    events.on('deleteCompletedTodo', deleteCompletedTodo)
    events.emit('renderCompletedTodos', completedTodos);

    function completedTask(completedTodo) {
      completedTodos.push(completedTodo);

      //remove To-do from Upcoming screen
      events.emit('deleteTodo', completedTodo.id);
      
      saveCompleted();
      events.emit('renderCompletedTodos', completedTodos);
    }

    function deleteCompletedTodo(idToDelete) {
      completedTodos = completedTodos.filter((completedTodo) => {
        if(completedTodo.id == idToDelete) {
          return false;
        } else return true;
      });

      saveCompleted();
      events.emit('renderCompletedTodos', completedTodos);
    }

    function saveCompleted() {
      localStorage.setItem('completedTodos', JSON.stringify(completedTodos));
    }
  })();