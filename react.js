const https = require("https");

const BASE = "https://react.zfile.web.id";

function request(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);

    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: "POST",

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",

        "Accept": "application/json",
        "Content-Type": "application/json",
        ...headers
      }

    }, res => {

      let data = "";

      res.on("data", c => data += c);

      res.on("end", () => {

        try {
          resolve(JSON.parse(data));
        } catch {
          reject(
            new Error("Response API tidak valid")
          );
        }

      });

    });

    req.on("error", reject);

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan"
    });
  }

  try {

    const {
      url,
      reactions,
      ticket,
      sessionId
    } = req.body || {};

    if (
      !url ||
      !url.includes("whatsapp.com/channel")
    ) {
      return res.status(400).json({
        success: false,
        message: "URL WhatsApp Channel tidak valid."
      });
    }

    if (
      !Array.isArray(reactions) ||
      reactions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Pilih minimal satu emoji."
      });
    }

    if (!ticket || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Ticket/session tidak tersedia."
      });
    }

    const result = await request(
      BASE + "/api/react",

      {
        url,
        reactions,
        ticket
      },

      {
        "X-ZX-Request": "zx-reactch",
        "X-Session-Id": sessionId
      }
    );

    return res.status(
      result.success ? 200 : 400
    ).json({
      success: result.success === true,
      message:
        result.message ||
        "Gagal mengirim reaksi.",
      data: result
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};
