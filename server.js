import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = "ARPJHDWAHFJCFF";

// 🎯 Smart detection function
function getService(productName) {
    const name = productName.toLowerCase();

    if (name.includes("follower")) return 1001;
    if (name.includes("like")) return 1002;
    if (name.includes("comment")) return 1010;
    if (name.includes("view")) return 1008;
    if (name.includes("save")) return 1006;

    return null;
}

// 🔢 Extract quantity from name (e.g. 5000 Likes)
function getQuantity(productName) {
    const match = productName.match(/\d+/);
    return match ? parseInt(match[0]) : 1000;
}

app.post("/webhook", async (req, res) => {
    try {
        const order = req.body;
        const item = order.line_items[0];

        const productName = item.name;

        // 🔗 Instagram link
        const link = item.properties?.find(p => p.name === "Instagram Link")?.value;

        // 🎯 Detect service
        const serviceId = getService(productName);

        // 🔢 Detect quantity from product name
        const quantity = getQuantity(productName);

        if (!serviceId) {
            console.log("❌ Unknown service:", productName);
            return res.sendStatus(200);
        }

        let bodyData = {
            key: API_KEY,
            action: "add",
            service: serviceId,
            link: link
        };

        // 💬 Comments special
        if (serviceId === 1010) {
            bodyData.comments = "Nice 🔥\nAwesome 💯\nGreat post!";
        } else {
            bodyData.quantity = quantity;
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
        console.log("🎯 Service:", serviceId);
        console.log("📦 Quantity:", quantity);
        console.log("📡 API:", data);

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
