const icon = document.getElementById("menubtn");
const navbar = document.getElementById("navbar");

icon.addEventListener("click", function() {
    navbar.classList.toggle("show");
});

//show alert when order is placed
function orderNow(cookieName) {
    alert("You ordered: " + cookieName + " 🍪")
}

document.querySelector(".order").addEventListener("click", function() {
    orderNow("S'mores Cookie")
})


