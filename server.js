//server.js
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require('compression');
const rateLimit= require('express-rate-limit');
const cookieParser = require("cookie-parser"); //npm install cookie-parser
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

dotenv.config();
const dbConnection = require("./config/database");
const ApiError = require("./utils/ApiError");
const globalError = require("./middlewares/errorMiddleware");

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
app.post('/webhook', express.raw({type: 'application/json'}) , checkoutWebhook); //?

//middelwares
if (process.env.NODE_ENV === "development") {
  //apply the morgan middleware only in devlelopment modes
  app.use(morgan("dev"));
}

//parse the req.body content from json to JavaScript object
app.use(express.json({limit:'20kb'})); 
app.use(express.static(path.join(__dirname, "uploads")));

// Sanatize the data that contains '$' or '.'
app.use(mongoSanitize());
// Cross Site Scripting Prevention (Sanatize data from tags)
app.use(xss());

// Limit each Ip to 100 request per `window` per 15 minutes
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Cookie-parser middleware to parse cookies (necessary for handling CSRF tokens)
app.use(cookieParser());

//Prevent HTTP Parameter Pollution (HPP) ??
app.use(hpp({ whitelist: ['filter', 'price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'] }));
// app.set('trust proxy', 1);
//Routes
mounteRoutes(app);

//handling incorrect routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//Global error handling middleware for express
app.use(globalError);

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

/*
express.raw({ type: 'application/json' }) ==> ensures that the req.body remains in its
raw binary data form (a Buffer) instead of being parsed into a JSON object, which is 
what express.json() or similar middleware would typically do.
This is crucial because Stripe's webhook signature 
verification (stripe.webhooks.constructEvent()) requires the raw, unmodified body to
calculate and compare the signature.
Without using express.raw(), the req.body would be a JavaScript object
*/
/*
app.use(hpp({ whitelist: ['filter', 'price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'] }));
in this line if any parameter is repeated for instance: ?sort=price&sort=-sold
what will happens is that express by default converts sort to an array [price, -sold] so 
the HPP middleware ignores the first the first parameter and apply the second one so -sold 
will be applies. hpp will not apply this rule on the whitelist
*/