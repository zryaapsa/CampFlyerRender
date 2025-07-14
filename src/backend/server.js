import express from "express";
import cors from "cors";
import midtransClient from "midtrans-client";
import { createClient } from "@supabase/supabase-js";

// Ganti dengan kredensial Anda. WAJIB GUNAKAN SERVICE ROLE KEY.
const supabaseUrl = "https://bjrdyjjsmfzhpcggdfwc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcmR5ampzbWZ6aHBjZ2dkZndjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQxNzg4NSwiZXhwIjoyMDY3OTkzODg1fQ.QcjcHpWQVGkoe8NL8lynnD2tQns62oDvL0K7uGTkNpI"; // GANTI DENGAN SERVICE ROLE KEY ANDA
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-tDBl_6fEZ0aySZAWaDleC8kv",
});
// HANYA SATU ENDPOINT UNTUK MEMBUAT ORDER BARU & TOKEN
app.post("/api/create-order", async (req, res) => {
  try {
    const { campaignId, userId, amount, paymentMethod } = req.body;
    console.log("📦 Menerima permintaan untuk membuat order...");

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, campaign_id: campaignId, status: "pending", metode: paymentMethod, amount: amount })
      .select().single();
      
    if (orderError) throw orderError;
    console.log(`✅ Order berhasil dibuat di Supabase, ID: ${orderData.id}`);

    const parameter = { transaction_details: { order_id: orderData.id, gross_amount: orderData.amount } };
    const transaction = await snap.createTransaction(parameter);
    console.log(`🎉 Token Midtrans berhasil dibuat untuk order ID: ${orderData.id}`);
    
    res.json({ token: transaction.token });
  } catch (error) {
    console.error("❌ Gagal di /api/create-order:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk membuat TOKEN untuk ORDER PENDING (dari halaman Histori -> Payment)
app.post("/api/create-token", async (req, res) => {
  try {
    const { orderId, grossAmount } = req.body;
    const uniqueMidtransOrderId = `${orderId}-${Date.now()}`;
    const parameter = { transaction_details: { order_id: uniqueMidtransOrderId, gross_amount: grossAmount } };
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint Webhook (Dengan Perbaikan)
app.post("/midtrans-notification", async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const order_id_from_midtrans = statusResponse.order_id;
    const transaction_status = statusResponse.transaction_status;
    const fraud_status = statusResponse.fraud_status;

    // p: Ambil ID order ASLI dengan memotong timestamp jika ada.
    // Format UUID (8-4-4-4-12) memiliki 5 bagian. Kita ambil 5 bagian pertama.
    const original_order_id = order_id_from_midtrans.split('-').slice(0, 5).join('-');
    console.log(`🔔 Notifikasi untuk Midtrans ID ${order_id_from_midtrans}, Order Asli ID: ${original_order_id}`);

    if (transaction_status == 'settlement' || (transaction_status == 'capture' && fraud_status == 'accept')) {
      // p: Gunakan ID ASLI untuk mencari, mengupdate, dan mengurangi kursi.
      const { data: orderData, error: orderError } = await supabase.from('orders').select('campaign_id, status').eq('id', original_order_id).single();
      if (orderError) throw new Error(`Order ${original_order_id} tidak ditemukan.`);
      if (orderData.status === 'success') {
        return res.status(200).send("OK (Sudah diproses)");
      }
      await supabase.from('orders').update({ status: 'success' }).eq('id', original_order_id);
      await supabase.rpc('kurangi_kursi', { campaign_id_input: orderData.campaign_id });
    } else if (transaction_status == 'deny' || transaction_status == 'expire' || transaction_status == 'cancel') {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', original_order_id);
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Gagal proses notifikasi:", error.message);
    res.status(500).json({ error: error.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server siap di port ${PORT}`));