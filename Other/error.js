module.exports = (req, res) => {
    const endpointnofoundbro = {
        errname: "errors.com.jungle.common.not_found",
        errcode: 1004,
        message: "This endpoint doesn't exist, make a ticket in the support server!",
        service: "any",
        intent: "prod"
    };

    res.set({
        'X-Epic-Error-Name': endpointnofoundbro.errname,
        'X-Epic-Error-Code': endpointnofoundbro.errcode
    });

    res.status(404).json({
        "errorCode": endpointnofoundbro.errname,
        "errorMessage": endpointnofoundbro.message,
        "numericErrorCode": endpointnofoundbro.errcode,
        "originatingService": endpointnofoundbro.service,
        "intent": endpointnofoundbro.intent
    });
};
