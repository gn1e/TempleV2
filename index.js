const Express = require("express");
const gang = Express();
const path = require("path")
const fs = require("fs")
const log = require("./Other/log.js");


gang.listen(3551, () => {
    log.backend(`Gang gang on port 3551`);
}).on("error", async (err) => {
    throw err;
});

gang.use((req, res, next) => {
    if (req.url.includes("..")) {
        res.redirect("https://gn1e.co");
        return;
    }

    if (req.originalUrl === '/') {
        next(); 
        return res.status(403).send(`bomb`);
        return;
    }

    const missiinngendpoint = req.originalUrl; 
    const msg = `[MISSING ENDPOINT] ${missiinngendpoint}\n`; 
    const endpointlog = path.join(__dirname, 'logs', 'missing_endpoints.log'); 

    fs.appendFileSync(endpointlog, msg);
    log.endpoint(`${missiinngendpoint}`);

    var XEpicErrorName = "errors.com.nade.common.not_found";
    var XEpicErrorCode = 1004;

    res.set({
        'X-Epic-Error-Name': XEpicErrorName,
        'X-Epic-Error-Code': XEpicErrorCode
    });

    res.status(404).json({
        "errorCode": XEpicErrorName,
        "errorMessage": "Endpoint not found? Make a ticket in the support server!",
        "numericErrorCode": XEpicErrorCode,
        "originatingService": "any",
        "intent": "prod"
    });
});