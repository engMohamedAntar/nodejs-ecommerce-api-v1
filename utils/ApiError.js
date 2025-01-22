//ApiError.js
class ApiError extends Error{
    constructor(message,statusCode){
        super(message);             
        this.statusCode= statusCode ;
        this.status= `${statusCode}`.startsWith(4)? 'fail' : 'error';
        this.isOperational= true;  
    }
}

module.exports= ApiError;

//#notices
//super(message);   ensures that ApiError retains the full functionality of the super Error class.

// remember that when an error object is passed to res.json(), the built-in properties
// of the Error object (such as message and stack) are not automatically included.