const RESEND_API = "https://api.resend.com/emails";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "noreply@inspectionforyou.com";

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "No Resend API key" }) };
  }

  try {
    const { to, subject, html, bcc, cc } = JSON.parse(event.body);

    const payload = {
      from: `U.S. Shingle & Metal <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };

    if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    if (cc)  payload.cc  = Array.isArray(cc)  ? cc  : [cc];

    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Email sent:", res.status, JSON.stringify(data));

    return {
      statusCode: res.ok ? 200 : res.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("send-email error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
