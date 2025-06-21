// Streamlines all the Error Messages we send to the console, for better debugging. 
// Error Class is in Node, as we call APIs using JS / Nodejs, we use it
class ApiError extends Error{
    constructor(statusCode, message= "Something went wrong", errors = [], stack= ""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false 
        this.errors = errors

        if(stack){
            this.stack= stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError};