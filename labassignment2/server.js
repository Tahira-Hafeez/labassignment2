// Import the express module
let express = require("express");

// Initialize an express application
let app = express();

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static("public"));


// Define a route for the root URL ('/')
app.get("/", function (req, res) {
  // Render the 'index.ejs' view
  return res.render("index");
});

// Start the server on port 3000
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

// Log a message to indicate that the server.js file is being executed
console.log("Console from server.js file");