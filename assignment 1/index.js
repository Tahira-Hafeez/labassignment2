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


document.getElementById("search-box")
    .addEventListener("input", function() {

    let searchValue = this.value.toLowerCase()

    if(searchValue === "") {
        document.getElementById("search-results").innerHTML = ""
        return
    }

    fetch("index.json")
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {

        let filtered = data.filter(function(cookie) {
            return cookie.name.toLowerCase().includes(searchValue)
        })

        if(filtered.length === 0) {
            document.getElementById("search-results").innerHTML = 
                `<p class="no-results">No cookies found! 😢</p>`
            return
        }

        let html = ""
        filtered.forEach(function(cookie) {
            let statusClass = cookie.status === "Available" 
                ? "status-available" //if
                : "status-soldout" //then

            html += `
                <div class="search-card">
                    <img src="${cookie.image}" alt="${cookie.name}">
                    <div>
                        <p class="search-tag">${cookie.tag}</p>
                        <h1 class="search-name">${cookie.name}</h1>
                        <h2 class="search-desc">${cookie.description}</h2>
                        <p class="${statusClass}">${cookie.status}</p>
                    </div>
                </div>
            `
        })

        document.getElementById("search-results").innerHTML = html
    })
})