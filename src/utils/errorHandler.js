import { ApiError } from "./ApiError.js";

const devError = (err, res) => {
    res.status(err.statusCode)
        .json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
};

// Error Handler for Production environment
const prodError = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode)
            .json({
                status: err.status,
                message: err.message,
            });
    } else {
        res.status(500)
            .json({
                status: "error",
                message: "something went very wrong!!!"
            })
    }
};

// Cast Error Handler
const castErrorHandler = (err) => {
    const message = `Invalid ${err.path}:${err.value}. `;
    return new ApiError(400, message)
}

// Handling Duplicate error
const duplicateErrorHandler = (err) => {

    // const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const value = err.message.match(/{[^{}]*}/)[0];
    console.log(value);
    const message = `field value: ${value} already exists. Please use another`;
    return new ApiError(400, message)
}

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // console.log({ errName: err, code: err.code,status:err.status,statusCode:err.statusCode });

    if (process.env.NODE_ENV === "development") {
        devError(err, res)
    } else if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError") err = castErrorHandler(err)
        if (err.code === 11000) err = duplicateErrorHandler(err)
        prodError(err, res)
    };
};
export default globalErrorHandler;