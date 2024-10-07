const gang = require("express");

gang.listen(3551, () => {
    console.log(`[BACKEND] Gang gang on port 3551`);
}).on("error", async (err) => {
    throw err;
});

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