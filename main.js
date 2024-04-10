let todos = [];

document.getElementById('add-task-button').addEventListener('click', displayForm)


function displayForm() {
  //cashe DOM
  let newTodoInput = document.getElementById('new-todo-input-container');

  newTodoInput.style.display = 'flex';

}

//sidebar transition
const openSidebarBtn = document.getElementById('hide-sidebar-button');
let isSidebarOpen = true;

openSidebarBtn.addEventListener('click', () => {
  if(isSidebarOpen){
    document.getElementById("sidebar").style.width = "15%";
    document.getElementById("right-side").style.marginLeft = "15%";
    isSidebarOpen = !isSidebarOpen
  } else {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("right-side").style.marginLeft= "0";
    isSidebarOpen = !isSidebarOpen
  }
});