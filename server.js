const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const clients = [];
const messages = [];

function sendAll(data) {
    clients.forEach(c => {
        c.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

app.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const client = {
        id: Date.now(),
        res
    };

    clients.push(client);

    req.on("close", () => {
        const index = clients.indexOf(client);
        if (index !== -1) clients.splice(index, 1);
    });
});

app.get("/messages", (req, res) => {
    res.json(messages);
});

app.post("/send", (req, res) => {
    let { name, text } = req.body;

    let admin = false;

    if (name === "*DUCK*") {
        name = "duck";
        admin = true;
    }

    const msg = {
        id: Date.now(),
        name,
        text,
        admin,
        ts: Date.now()
    };

    messages.push(msg);

    sendAll({
        type: "msg",
        ...msg
    });

    res.json({ ok: true });
});

app.listen(3000, () => {
    console.log("Server läuft");
});
