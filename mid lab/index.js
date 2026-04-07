const icon = document.getElementById("menubtn");
const navbar = document.getElementById("navbar");

icon.addEventListener("click", function() {
    navbar.classList.toggle("show");
});

$(document).ready(function () {
  $.ajax({
    url: 'https://fakestoreapi.com/products?limit=4',
    method: 'GET',
    dataType: 'json',

    success: function (products) {
      $('#loader').hide();          // hide spinner on success
      renderProducts(products);     // Task 2: inject cards into DOM
    },

    error: function () {
      $('#loader').text('Failed to load products. Please try again.');
    }
  });


  /* ──────────────────────────────────────────
     TASK 2 – DOM Manipulation
     Clear existing content, then inject product cards
  ────────────────────────────────────────── */
  function renderProducts(products) {

    // Clear any hard-coded / previous content first
    $('#product-container').empty();

    // Loop through each product returned by the API
    $.each(products, function (index, product) {

      var stars = getStars(product.rating.rate);

      // Build card HTML string
      var card = `
        <div class="product-card">
          <img src="${product.image}" alt="${product.title}" />
          <p class="card-category">${product.category}</p>
          <h3>${product.title}</h3>
          <p class="card-price">$${product.price.toFixed(2)}</p>
          <p class="card-rating">
            <span>${stars}</span>
            ${product.rating.rate} / 5
            (${product.rating.count} reviews)
          </p>
          <div class="card-actions">
            <button class="btn-cart">Add to Cart</button>

            <!-- All product data stored in data-* attributes -->
            <!-- Task 3: Quick View button -->
            <button class="btn-quickview"
              data-id="${product.id}"
              data-title="${encodeURIComponent(product.title)}"
              data-desc="${encodeURIComponent(product.description)}"
              data-price="${product.price}"
              data-img="${product.image}"
              data-category="${product.category}"
              data-rate="${product.rating.rate}"
              data-count="${product.rating.count}">
              Quick View
            </button>
          </div>
        </div>`;

      // Append card to the product grid
      $('#product-container').append(card);
    });
  }


  /* ──────────────────────────────────────────
     HELPER – Convert numeric rating to star icons
  ────────────────────────────────────────── */
  function getStars(rate) {
    var fullStars  = Math.round(rate);
    var emptyStars = 5 - fullStars;
    return '&#9733;'.repeat(fullStars) + '&#9734;'.repeat(emptyStars);
  }

  $(document).on('click', '.btn-quickview', function () {
    var btn = $(this);

    // Populate modal with this product's data
    $('#modal-img').attr('src', btn.data('img'));
    $('#modal-category').text(btn.data('category'));
    $('#modal-title').text(decodeURIComponent(btn.data('title')));
    $('#modal-desc').text(decodeURIComponent(btn.data('desc')));
    $('#modal-price').text('$' + parseFloat(btn.data('price')).toFixed(2));
    $('#modal-rating').html(
      '<span>' + getStars(btn.data('rate')) + '</span> ' +
      btn.data('rate') + ' / 5 (' + btn.data('count') + ' reviews)'
    );

    // Show the modal (CSS uses display:flex when .active is present)
    $('#modal-overlay').addClass('active');
  });


  // Close modal – ✕ button
  $('#modal-close').on('click', function () {
    $('#modal-overlay').removeClass('active');
  });

  // Close modal – click on dark backdrop (outside the box)
  $('#modal-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-overlay')) {
      $('#modal-overlay').removeClass('active');
    }
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('#modal-overlay').removeClass('active');
    }
  });

}); 