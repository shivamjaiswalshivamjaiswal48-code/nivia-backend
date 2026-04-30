import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

// 🎯 Detect services
function detectServices(productName) {
    const name = productName.toLowerCase();
    let services = [];

    if (name.includes("follower")) {
        services.push({ service: 1001, qty: extractQty(name, "follower") });
    }

    if (name.includes("like")) {
        services.push({ service: 1002, qty: extractQty(name, "like") });
    }

    if (name.includes("view")) {
        services.push({ service: 1008, qty: extractQty(name, "view") });
    }

    if (name.includes("save")) {
        services.push({ service: 1006, qty: extractQty(name, "save") });
    }

    if (name.includes("comment")) {
        services.push({ service: 1010, qty: extractQty(name, "comment") });
    }

    return services;
}

// 🔢 Extract quantity near keyword
function extractQty(text, keyword) {
    const regex = new RegExp("(\\d+)[^\\d]*" + keyword);
    const match = text.match(regex);
    return match ? parseInt(match[1]) : 1000;
}

app.post("/webhook", async (req, res) => {
    try {
        const order = req.body;
        const item = order.line_items[0];

        const productName = item.name;

        const link = item.properties?.find(p => p.name === "Instagram Link")?.value;

        const services = detectServices(productName);

        if (services.length === 0) {
            console.log("❌ No services detected");
            return res.sendStatus(200);
        }

        for (const s of services) {
            let bodyData = {
                key: API_KEY,
                action: "add",
                service: s.service,
                link: link
            };

            if (s.service === 1010) {
                bodyData.comments = "Nice 🔥\nAwesome 💯\nGreat!";
            } else {
                bodyData.quantity = s.qty;
            }

            const response = await fetch("https://niva-miners.com/api/v1/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            console.log("🛒 Product:", productName);
            console.log("🎯 Service:", s.service);
            console.log("📦 Quantity:", s.qty);
            console.log("📡 API:", data);
        }

        res.sendStatus(200);

    } catch (err) {
        console.error("❌ Error:", err);
        res.sendStatus(500);
    }
});

app.get("/", (req, res) => {
    res.send("Server running ✅");
});

app.listen(3000, () => console.log("🚀 Running"));
