import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import path from "path";
import csv from "csv-parser";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Function to call the new RapidAPI for summarization
async function callNewRapidAPI(prompt) {
  const options = {
    method: "POST",
    url: "https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions",
    headers: {
      "x-rapidapi-key": "bde69bbf23msh379081f8650c1b8p163a57jsn20248c9ef4f7",
      "x-rapidapi-host":
        "cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    },
  };

  const response = await axios.request(options);
  return response.data;
}

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const command = req.body.command; // Get the user command
      const prompt = `Based on the following data: ${JSON.stringify(
        results
      )}, ${command}`;

      try {
        const output = await callNewRapidAPI(prompt);
        fs.unlinkSync(req.file.path); // Clean up the uploaded file
        res.status(200).json({ output: output.choices[0].message.content }); // Adjust based on response structure
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to get response from the API." });
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).json({ error: "Failed to process the file." });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
