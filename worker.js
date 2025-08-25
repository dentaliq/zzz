export default {
  async fetch(request, env) {
    // دعم OPTIONS للـ preflight (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const BOT_TOKEN = env.AB;
      const CHAT_ID = env.BC;

      if (!BOT_TOKEN || !CHAT_ID) {
        return new Response("Missing BOT_TOKEN or CHAT_ID in environment variables.", { status: 400 });
      }

      let messageText = "";

      if (request.method === "POST") {
        try {
          // قراءة البيانات من جسم الطلب
          const orderData = await request.json();
          
          // تنسيق الرسالة بشكل مناسب لتيليجرام
          messageText = `
<b>🔔 طلب جديد!</b>
--------------------------------------
<b>المنتج:</b> ${orderData.productName}
<b>الاسم:</b> ${orderData.name}
<b>الهاتف:</b> ${orderData.phone}
<b>الكمية:</b> ${orderData.quantity}
<b>العنوان:</b> ${orderData.address}
<b>نقطة دالة:</b> ${orderData.landmark}
<b>السعر الإجمالي:</b> ${orderData.totalPrice.toLocaleString('ar-SY')} د.ع
<b>وقت الطلب:</b> ${new Date().toLocaleString('ar-SA')}
          `;
          
        } catch (e) {
          // في حال فشل قراءة JSON
          return new Response("Invalid JSON data.", { status: 400 });
        }
      } else {
        return new Response("This endpoint only accepts POST requests.", { status: 405 });
      }

      // إرسال الرسالة إلى تيليجرام
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const payload = {
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: "HTML",
      };

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Telegram API Error:", errorDetails);
        return new Response(`Failed to send message to Telegram. Details: ${JSON.stringify(errorDetails)}`, { status: 500 });
      }

      return new Response("تم إرسال الرسالة بنجاح إلى تيليجرام ✅", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });

    } catch (err) {
      return new Response("Internal Server Error: " + err.message, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
  },
};
