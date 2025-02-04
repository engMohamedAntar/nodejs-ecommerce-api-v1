const csrf = require("csurf"); //npm install csurf

const csrfProtection = csrf({
    cookie: {
      httpOnly: process.env.NODE_ENV=== 'production', // The cookie will not be accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Set secure flag for production
      sameSite: 'Strict', // Helps prevent CSRF attacks
      maxAge: 3600000 // Cookie expiry time (1 hour)
    }
  });
  
module.exports= csrfProtection;