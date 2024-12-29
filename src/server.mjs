import express, { json } from "express";
import cors from "cors";
import { evaluateSite } from "./filters.mjs";
import { updateOrInsertRating } from "./db_query.mjs";
const app = express();

app.use(cors());
app.use(json());

app.post("/checkURL", async (req, res) => {
  console.log("will be checked!");
  const url = req.body.inputString;
  try {
    const rate = await evaluateSite(url);
    res.json({ message: rate });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while evaluating the site." });
  }
});

// Endpoint to handle reporting a URL as safe or malicious
app.post("/reportMalicious", (req, res) => {
  const { inputString: url } = req.body;
  try {
    // Log the report (replace with actual database or storage logic if needed)
    console.log(`URL '${url}' reported as malicious`);

    updateOrInsertRating(url, false);

    res.json({
      message: `The URL '${url}' was reported as malicious`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while reporting the site." });
  }
});

app.post("/reportSafe", (req, res) => {
  const { inputString: url } = req.body;
  try {
    // Log the report (replace with actual database or storage logic if needed)
    console.log(`URL '${url}' reported as safe`);

    updateOrInsertRating(url, true);

    res.json({
      message: `The URL '${url}' was reported as safe`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while reporting the site." });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
