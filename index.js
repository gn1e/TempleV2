const gang = require("express");

console.log("backend.gang is running on port");

// error 1day
gang.use((req, res, next) => {
    if (req.url.includes("..")) {
        res.redirect("https://gn1e.co")
        return;
    }
    error.createError(
        "errors.com.jungle.common.not_found", 
        "The endpoint you tried to access is not found! Report this to discord.gg/junglefn", 
        undefined, 1004, undefined, 404, res
    );
});