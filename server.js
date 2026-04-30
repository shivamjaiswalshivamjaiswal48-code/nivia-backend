import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post("/webhook", async (req, res) => {
    const order = req.body;

    const item = order.line_items[0];

    const link = item.properties?.find(p => p.name === "Instagram Link")?.value;

    const quantity = item.quantity * 1000;

    const response = await fetch("https://niva-miners.com/api/v1/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: API_KEY,
            action: "add",
            service: 1001,
            link: link,
            quantity: quantity
        })
    });

    const data = await response.json();
    console.log(data);

    res.sendStatus(200);
});

app.listen(3000, () => console.log("Running"));
