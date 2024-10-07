function backend() {
    let msg = "";

    for (let i in backend.arguments) {
        msg += `${i == "0" ? "" : " "}${backend.arguments[i]}`;
    }

    console.log(`\x1b[32m[BACKEND]\x1b[90m ${msg}`);
}

function bot() {
    let msg = "";

    for (let i in bot.arguments) {
        msg += `${i == "0" ? "" : " "}${bot.arguments[i]}`;
    }

    console.log(`\x1b[33m[DISCORD]\x1b[90m ${msg}`);
}

function xmpp() {
    let msg = "";

    for (let i in xmpp.arguments) {
        msg += `${i == "0" ? "" : " "}${xmpp.arguments[i]}`;
    }

    console.log(`\x1b[34m[XMPP]\x1b[90m ${msg}`);
}

function error() {
    let msg = "";

    for (let i in error.arguments) {
        msg += `${i == "0" ? "" : " "}${error.arguments[i]}`;
    }

    console.log(`\x1b[31m[ERROR]\x1b[90m ${msg}`);
}

function mongo() {
    let msg = "";

    for (let i in mongo.arguments) {
        msg += `${i == "0" ? "" : " "}${mongo.arguments[i]}`;
    }

    console.log(`\x1b[35m[MONGO]\x1b[90m ${msg}`);
}

function endpoint() {
    let msg = "";

    for (let i in endpoint.arguments) {
        msg += `${i == "0" ? "" : " "}${endpoint.arguments[i]}`;
    }

    console.log(`\x1b[36m[MISSING ENDPOINT]\x1b[90m ${msg}`);
}

module.exports = {
    backend,
    bot,
    xmpp,
    error,
    mongo,
    endpoint
}
