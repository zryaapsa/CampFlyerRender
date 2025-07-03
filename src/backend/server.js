// server.js
import express from "express";
import cors from "cors";
import midtransClient from "midtrans-client";

const app = express();
app.use(cors());
app.use(express.json());

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "Mid-server-MGAVn5CXdhV04q5xTB1ZPRIc",
});

app.post("/payment/create", async (req, res) => {
  try {
    const { orderId, grossAmount } = req.body;
    console.log("📦 ORDER PAYLOAD:", { orderId, grossAmount });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: {
        secure: true,
      },
      qris: {}, 
    };
    

    const transaction = await snap.createTransaction(parameter);
    console.log("🎉 Snap Token:", transaction.token);

    res.json({ token: transaction.token });
  } catch (error) {
    console.error("❌ Midtrans error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
