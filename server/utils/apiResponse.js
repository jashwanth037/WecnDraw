const apiResponse = {
    success: (res, message = 'Success', data = {}, statusCode = 200) => {
        return res.status(statusCode).json({ success: true, message, data });
    },
    error: (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
        const response = { success: false, message };
        if (errors) response.errors = errors;
        return res.status(statusCode).json(response);
    },
};

module.exports = apiResponse;
