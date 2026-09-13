const https = require("https");

const BASE = "https://react.zfile.web.id";

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);

    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        ...headers
      }
    }, res => {
      let data = "";

      res.on("data", c => data += c);

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Response API tidak valid"));
        }
      });
    });

    req.on("error", reject);

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });

    req.end();
  });
}

module.exports = async (req, res) => {
  try {
    const chars =
      "abcdefghijklmnopqrstuvwxyz0123456789";

    let sessionId = "zx_";

    for (let i = 0; i < 16; i++) {
      sessionId +=
        chars[Math.floor(Math.random() * chars.length)];
    }

    const result = await request(
      BASE + "/api/challenge",
      {
        "X-Session-Id": sessionId
      }
    );

    res.status(200).json({
      success: true,
      sessionId,
      challenge: result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
