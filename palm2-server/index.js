require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(bodyParser.json());

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

app.post("/api", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const [result] = await client.generateText({
      model: MODEL_NAME,
      prompt: { text: prompt },
    });

    console.log("API Response:", JSON.stringify(result, null, 2));

    const answer =
      result.candidates && result.candidates[0] && result.candidates[0].output;

    if (answer) {
      console.log("Prompt: ", prompt);
      console.log("Answer: ", answer);
      res.json({ success: true, answer });
    } else if (result.filters && result.filters.length > 0) {
      console.log("Response filtered out by the API.");
      res
        .status(400)
        .json({
          success: false,
          message: "Response filtered out by the API due to safety reasons.",
        });
    } else {
      console.log("No valid answer found in response.");
      res
        .status(400)
        .json({
          success: false,
          message: "No valid answer found in response.",
        });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.details || err.message });
  }
});



app.listen(3333, () => console.log("Server running on port 3333"));
