// @ts-check
const express = require("express");
const turnstile = require("./turnstile");
const visit = require("./bot");

const app = express();
const memories = new Map(); // string -> string

app.use(express.urlencoded({ extended: false }));

app.post("/submit", turnstile, async (req, res) => {
  const memoryId = crypto.randomUUID(),
    { content, name, draft } = req.body;

  if (typeof content !== "string" || typeof name !== 'string') {
    return res.status(400).send("Invalid content");
  }
  const url = new URL("/my-messages", req.body.url);
  url.searchParams.set("id", memoryId);

  memories.set(memoryId, { content, name });

  if (!draft) {
    try {
      console.log(`[+] Sending ${url} to bot`);
      visit(url);
      res.send("OK");
    } catch (e) {
      console.log(`[-] Failed to send ${url} to bot: `, e);
      res.status(500).send("Something is wrong...");
    }
  }
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

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
