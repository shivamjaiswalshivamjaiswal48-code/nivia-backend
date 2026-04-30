import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔒 API KEY (replace with your real key or use ENV)
const API_KEY = process.env.API_KEY || "PUT_YOUR_API_KEY_HERE";

// 🎯 Detect service (only followers for now)
function getService(productName) {
    const name = productName.toLowerCase();

    if (name.includes("follower")) return 1001;

    return null;
}

// 🔢 Extract quantity (e.g. 100 Followers)
function getQuantity(productName) {
    const match = productName.match(/\d+/);
    return match ? parseInt(match[0]) : 100;
}

app.post("/webhook", async (req, res) => {
    try {
        const order = req.body;
        const item = order.line_items[0];

        const productName = item.name;

        console.log("🛒 Product:", productName);

        // 🔗 Get Instagram input
        let link = item.properties?.find(p => p.name === "Instagram Link")?.value;

        console.log("🔗 Raw Input:", link);

        if (!link) {
            console.log("❌ No link provided");
            return res.sendStatus(200);
        }

        // 🧹 CLEAN & EXTRACT USERNAME
        link = link.trim();

        let username = link
            .replace("https://", "")
            .replace("http://", "")
            .replace("www.", "")
            .replace("instagram.com/", "")
            .split("?")[0]
            .replace(/\/+$/, "");

        console.log("✅ Username:", username);

        // 🎯 Detect service
        const serviceId = getService(productName);

        if (!serviceId) {
            console.log("❌ Unsupported product");
            return res.sendStatus(200);
        }

        // 🔢 Quantity
        const quantity = getQuantity(productName);

        // 🚀 API CALL
        const bodyData = {
            key: API_KEY,
            action: "add",
            service: serviceId,
            link: username, // 🔥 IMPORTANT (username only)
            quantity: quantity
        };

        console.log("📤 Sending to API:", bodyData);

        const response = await fetch("https://niva-miners.com/api/v1/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        console.log("📡 API Response:", data);

        res.sendStatus(200);

    } catch (err) {
        console.error("❌ Error:", err);
        res.sendStatus(500);
    }
});

// 🟢 Health check
app.get("/", (req, res) => {
    res.send("🚀 Server Running");
});

app.listen(3000, () => {
    console.log("🔥 Server started on port 3000");
});
