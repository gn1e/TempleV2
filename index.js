// crazy scuff

const Express = require("express");
const gang = Express();
const path = require("path")
const fs = require("fs")
const log = require("./Other/log.js");
const handleMissingEndpoint = require('./Other/error.js'); 

fs.readdirSync(path.join(__dirname, 'Routes')).forEach(fileName => {
    if (fileName.endsWith('.js')) {
        const route = require(`./Routes/${fileName}`);
        if (typeof route === 'function') {
            gang.use(route);
            log.route(`${fileName} loaded!`);
        } else {
            log.error(`${fileName} does not export a function`);
        }
    }
});

gang.listen(3551, () => {
    log.backend(`TempleV2 is running on port 3551`);
}).on("error", async (err) => {
    throw err;
});

gang.use((req, res, next) => {
    if (req.url.includes("..")) {
        res.redirect("https://gn1e.co");
        return;
    }

    // bomb bro
    if (req.originalUrl === '/') {
        next(); 
        return res.status(403).send('bomb');
    }

    // crazy lazy
    if (req.originalUrl === '/favicon.ico') {
        next(); 
        return res.status(403).send('another bomb');
    }

    const missingEndpoint = req.originalUrl; 
    const msg = `[MISSING ENDPOINT] ${missingEndpoint}\n`; 
    const endpointLog = path.join(__dirname, 'logs', 'missing_endpoints.log'); 

    fs.appendFileSync(endpointLog, msg); 
    log.endpoint(`${missingEndpoint}`); 

    handleMissingEndpoint(req, res);
});