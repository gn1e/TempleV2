const Express = require("express");
const gang = Express();
const path = require("path")
const fs = require("fs")
const log = require("./Other/log.js");
const handleMissingEndpoint = require('./Other/error.js'); 


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
        return res.status(403).send('bomb');
    }

    const missingEndpoint = req.originalUrl; 
    const msg = `[MISSING ENDPOINT] ${missingEndpoint}\n`; 
    const endpointLog = path.join(__dirname, 'logs', 'missing_endpoints.log'); 

    fs.appendFileSync(endpointLog, msg); 
    log.endpoint(`${missingEndpoint}`); 

    handleMissingEndpoint(req, res);
});