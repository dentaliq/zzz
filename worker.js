export default {
  async fetch(request, env) {
    try {
      const BOT_TOKEN = env.AB;
      const CHAT_ID = env.BC;

      if (!BOT_TOKEN || !CHAT_ID) {
        return new Response("Missing BOT_TOKEN or CHAT_ID", { status: 400 });
      }

      let fields = {};

      if (request.method === "POST") {
        // محاولة قراءة JSON أولاً
        try {
          fields = await request.json();
        } catch {
          // إذا لم يكن JSON، جرب قراءة form-data أو text
          const text = await request.text();
          if (text.includes("=")) {
            fields = Object.fromEntries(new URLSearchParams(text));
          } else {
            fields = { raw: text };
          }
        }
      } else {
        // قراءة الحقول من query string (GET)
        const url = new URL(request.url);
        fields = Object.fromEntries(url.searchParams);
      }

      // تحويل الحقول إلى نص مرتب
      let message = "📩 **بيانات جديدة من الـWorker**:\n";
      for (const [key, value] of Object.entries(fields)) {
        message += `\n• ${key}: ${value}`;
      }

      // إرسال الرسالة إلى تيليجرام
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const payload = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      };

      await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return new Response("تم إرسال الرسالة إلى تيليجرام ✅", { status: 200 });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  },
};
