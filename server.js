import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔒 API key from Render env
const API_KEY = process.env.API_KEY;

// 🎯 Product → Service mapping
const serviceMap = {
    "Instagram Followers": 1001,
    "Instagram Likes": 1002,
    "Story Views": 1008,
    "Custom Comments": 1010
};

app.post("/webhook", async (req, res) => {
    try {
        const order = req.body;
        const item = order.line_items[0];

        const productName = item.name;

        // 🔗 Get Instagram link
        const link = item.properties?.find(p => p.name === "Instagram Link")?.value;

        // 🔢 Convert quantity (1 = 1000)
        const quantity = item.quantity * 1000;

        // 🎯 Select correct service
        const serviceId = serviceMap[productName];

        if (!serviceId) {
            console.log("❌ Service not mapped:", productName);
            return res.sendStatus(200);
        }

        // 💬 Special case for comments
        let bodyData = {
            key: API_KEY,
            action: "add",
            service: serviceId,
            link: link
        };

        if (serviceId === 1010) {
            bodyData.comments = "Nice post\nAwesome 🔥\nGreat!";
        } else {
            bodyData.quantity = quantity;
        }

        // 📡 Call Nivia API
        const response = await fetch("https://niva-miners.com/api/v1/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        console.log("✅ Order:", productName);
        console.log("📡 API Response:", data);

        res.sendStatus(200);

    } catch (err) {
        console.error("❌ Error:", err);
        res.sendStatus(500);
    }
});

app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

app.listen(3000, () => console.log("🚀 Server running"));
