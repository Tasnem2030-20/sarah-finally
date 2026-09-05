export const ErrorResponse = ({
    message = "Error",
    status = 400,
    extra = undefined,
} = {}) => {
    const errorMessage = typeof message === "string" ? message : message?.message;
    const error = new Error(errorMessage);
    
    error.status = status;
    error.extra = extra;
    
    throw error;
};


export const BadRequestException = ({
    message = "BadRequestException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 400, extra });
};
export const conflictException = ({
    message = "ConflictException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 409, extra });
};

export const UnauthorizedException = ({
    message = "UnauthorizedException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 401, extra });
};

export const NotFoundException = ({
    message = "NotFoundException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 404, extra });
};
export const forbiddenException = ({
    message = "ForbiddenException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 403, extra });
};
export const toomanyrequestsException = ({
    message = "TooManyRequestsException",
    extra = undefined,
} = {}) => {
    return ErrorResponse({ message, status: 429, extra });
};


export const globalErrorHandler = (err, req, res, next) => {
    const status = err.status ?? 500;
    return res
        .status(status)
        .json({ message: err.message, stack: err.stack, status });
};
