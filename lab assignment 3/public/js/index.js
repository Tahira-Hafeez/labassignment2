const icon = document.getElementById("menubtn");
const navbar = document.getElementById("navbar");

icon.addEventListener("click", function() {
    navbar.classList.toggle("show");
});
