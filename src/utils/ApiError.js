class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something went wrong !!",
        errors=[],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors ,

        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error",
        this.isOperational = true

        if(stack){
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}