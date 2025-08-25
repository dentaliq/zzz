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
        return new Response("Missing BOT_TOKEN or CHAT_ID", { status: 400 });
      }

      let messageContent = "";

      if (request.method === "POST") {
        try {
          const fields = await request.json();
          messageContent = JSON.stringify(fields, null, 2);
        } catch {
          messageContent = await request.text();
        }
      } else {
        const url = new URL(request.url);
        messageContent = url.searchParams.toString();
      }

      // إرسال الرسالة إلى تيليجرام
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const payload = {
        chat_id: CHAT_ID,
        text: messageContent,
        parse_mode: "Markdown",
      };

      await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return new Response("تم إرسال الرسالة إلى تيليجرام ✅", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (err) {
      return new Response("Error: " + err.message, {
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
