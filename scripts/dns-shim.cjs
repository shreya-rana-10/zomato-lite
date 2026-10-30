// Local quirk fix: this machine's router DNS refuses lookups for some
// foreign hostnames (Neon's, for example), while public DNS resolves them
// fine. This shim makes Node answer its own DNS questions via Cloudflare
// (1.1.1.1) over HTTPS — a method called "DNS over HTTPS" (DoH) — and
// caches the answers. It is loaded with --require before anything runs.
// Purely a local-dev convenience: on Vercel, DNS works normally.
const dns = require("node:dns");
const https = require("node:https");

const cache = new Map(); // hostname -> [{ address, family }]

function resolveViaDoh(hostname) {
  return new Promise((resolve, reject) => {
    const url = `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const req = https.get(
      url,
      { headers: { accept: "application/dns-json" } },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            const records = (data.Answer || [])
              .filter((record) => record.type === 1) // type 1 = A (IPv4)
              .map((record) => ({ address: record.data, family: 4 }));
            records.length
              ? resolve(records)
              : reject(new Error(`no A record for ${hostname}`));
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(5000, () => req.destroy(new Error("DoH timeout")));
  });
}

const originalLookup = dns.lookup;

dns.lookup = function patchedLookup(hostname, options, callback) {
  let opts = options;
  let cb = callback;
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  // Leave IP literals, "localhost", and IPv6 requests untouched —
  // those all worked fine without help.
  const isIpLiteral = typeof hostname !== "string" || /^[0-9.]+$/.test(hostname);
  if (isIpLiteral || hostname === "localhost" || opts.family === 6) {
    return originalLookup(hostname, opts, cb);
  }

  const finish = (records) => {
    if (opts && opts.all) {
      cb(null, records);
    } else if (records.length > 0) {
      cb(null, records[0].address, records[0].family);
    } else {
      const error = new Error(`getaddrinfo ENOTFOUND ${hostname}`);
      error.code = "ENOTFOUND";
      cb(error);
    }
  };

  const cached = cache.get(hostname);
  if (cached) {
    process.nextTick(() => finish(cached));
    return;
  }

  resolveViaDoh(hostname).then(
    (records) => {
      cache.set(hostname, records);
      finish(records);
    },
    () => {
      // Shim could not answer — fall back to the normal resolver, which
      // keeps "friendly" names like localhost working as before.
      originalLookup(hostname, opts, cb);
    }
  );
};
