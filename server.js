//server.js
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require('compression');
const bodyParser = require('body-parser')
dotenv.config();
const dbConnection = require("./config/database");
const ApiError = require("./utils/ApiError");
const golbalError = require("./middlewares/errorMiddleware");

//routes
const mounteRoutes = require("./routes"); //will get the index file by default
const {checkoutWebhook}= require('./services/orderService');

//connect to database
dbConnection();

//express app
const app = express();

// Enable other domains to access your app
app.use(cors());
app.options("*", cors()); //?
//compress all responses
app.use(compression());

// webhook for the checkout process
app.post('/webhook', express.raw({type: 'application/json'}) , checkoutWebhook);
// 
// bodyParser.raw({ type: 'application/json' })
//middelwares
if (process.env.NODE_ENV === "development") {
  //apply the morgan middleware only in devlelopment modes
  app.use(morgan("dev"));
}
app.use(express.json()); //parse the req.body content
app.use(express.static(path.join(__dirname, "uploads")));

//Routes
mounteRoutes(app);



//handling incorrect routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//Global error handling middleware for express
app.use(golbalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});           

// Handle errors outside express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shutting down...");
    process.exit(1);
  });
});

//notices
// server.close() --> stops the server from accepting new connections but allows existing connections to finish processing before fully shutting down.
// The callback function passed to server.close() is executed once all active requests are completed and the server is ready to shut down.
// process.exit(1)--> This command terminates the Node.js process

// app.use(express.static(path.join(__dirname,'uploads')));--> enables you to access
// this route-> http://localhost:8000/categories/category-c9dcad34-92cc-4ee0-a302-1189bb7b7b5a-1728220346093.jpeg
// and you can change categories to brands or whatever

// app.use(cors()); is used for simple requrests while app.options('*', cors()); is used for complex requests

