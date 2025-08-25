export default {
  async fetch(request, env) {
    try {
      const BOT_TOKEN = env.AB;
      const CHAT_ID = env.BC;

      if (!BOT_TOKEN || !CHAT_ID) {
        return new Response("Missing BOT_TOKEN or CHAT_ID", { status: 400 });
      }

      let messageContent = "";

      if (request.method === "POST") {
        // محاولة قراءة JSON أولاً
        try {
          const fields = await request.json();
          // تحويل JSON إلى نص قابل للقراءة
          messageContent = JSON.stringify(fields, null, 2);
        } catch {
          // إذا لم يكن JSON، جرب قراءة form-data أو text
          messageContent = await request.text();
        }
      } else {
        // قراءة الحقول من query string (GET)
        const url = new URL(request.url);
        // تحويل query params إلى نص
        messageContent = url.searchParams.toString();
      }

      // إرسال الرسالة إلى تيليجرام
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const payload = {
        chat_id: CHAT_ID,
        text: messageContent,
        parse_mode: "Markdown", // يمكن تغييره إلى "HTML" أو إزالته إذا لم يكن النص بحاجة لتنسيق
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
