const icon = document.getElementById("menubtn");
const navbar = document.getElementById("navbar");

if (icon) {
  icon.addEventListener("click", function() {
    navbar.classList.toggle("show");
  });
}

function placeOrder(productId) {
  if (!window.TOKEN || window.TOKEN === "null") {
    alert("Please log in first.");
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: "/api/v1/orders",
    method: "POST",
    headers: { "Authorization": "Bearer " + window.TOKEN },
    contentType: "application/json",
    data: JSON.stringify({
      products: [{ productId: productId, quantity: 1 }]
    }),
    success: function() {
      alert("Order placed successfully!");
    },
    error: function(xhr) {
      if (xhr.status === 401) {
        alert("Please log in first.");
        window.location.href = "/login";
      } else {
        alert("Something went wrong.");
      }
    }
  });
}