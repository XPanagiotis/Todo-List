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
})


