// @ts-check
const express = require("express");
const turnstile = require("./turnstile");
const visit = require("./bot");

const app = express();
const memories = new Map(); // string -> string

const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: false }));

app.post("/submit", turnstile, async (req, res) => {
  const memoryId = crypto.randomUUID();

  let { content, name, receiveMail } = req.body;

  name = name.replace(/\n/g, "<br />").replace(/>/g, "&gt;");
  content = content
    .replace(/\n/g, "<br />")
    .replace(/</g, "&lt;")
    .replace(/on\w+/g, "on");

  console.log(
    `[+] Received memory ${memoryId} from ${req.ip}, body: `,
    req.body
  );

  if (typeof content !== "string" || typeof name !== "string") {
    return res.status(400).send("Invalid content");
  }

  if (name.length >= 20) {
    return res.status(400).send("Name too long");
  }

  let url;
  try {
    url = new URL(req.headers.referer || "");
  } catch (e) {
    return res.status(400).send("Invalid referer");
  }

  url.searchParams.set("id", memoryId);

  memories.set(memoryId, { content, name });

  if (receiveMail === "yes") {
    try {
      console.log(`[+] Sending ${url} to bot`);
      visit(url);
    } catch (e) {
      console.log(`[-] Failed to send ${url} to bot: `, e);
      return res.status(500).send("Something is wrong...");
    }
  }

  return res.status(302).redirect(url.href);
});

app.get("/message", (req, res) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).send("Invalid id");
  }

  const memory = memories.get(id);

  if (!memory) {
    return res.status(404).send("Memory not found");
  }

  res.send({ memory });
});

app.set("trust proxy", true);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
