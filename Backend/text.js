import axios from "axios";
import express from "express";
import fs from "fs";
import { Parser } from "json2csv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the CSV file
app.get("/download-csv", (req, res) => {
  const filePath = path.join(__dirname, "ai_customs_brokerage_articles.csv");
  res.download(filePath, "ai_customs_brokerage_articles.csv", (err) => {
    if (err) {
      res.status(500).send("Error sending file.");
    }
  });
});

// Function to sleep for a given time
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to search using Google Custom Search
async function searchGoogleCustomSearch(topic, numPages) {
  const apiKey = "AIzaSyAG-GiizLbigAIOk0lHA__dr_Z4HkAGOMI"; // Your Google API key
  const searchEngineId = "b3550bf159bd045a3"; // Your Search Engine ID

  if (!topic || topic.trim() === "") {
    throw new Error("Search topic cannot be empty.");
  }

  const results = [];
  const requestsNeeded = Math.ceil(numPages / 10);

  for (let i = 0; i < requestsNeeded; i++) {
    const currentNum = Math.min(10, numPages - i * 10);
    let retries = 0;

    while (retries < 5) {
      try {
        const response = await axios.get(
          "https://www.googleapis.com/customsearch/v1",
          {
            params: {
              key: apiKey,
              cx: searchEngineId,
              q: topic,
              num: currentNum,
              start: i * 10 + 1, // Google API requires start to be 1-based
            },
          }
        );

        const searchResults = response.data.items || [];
        if (searchResults.length > 0) {
          const articles = searchResults.map((item) => ({
            Title: item.title,
            Content: item.snippet,
            Source: item.link,
          }));
          results.push(...articles);
        }

        // Sleep to avoid hitting API rate limits
        await sleep(2000);
        break; // Exit the retry loop on success
      } catch (error) {
        console.error("API Error:", error); // Log error
        if (error.response) {
          console.error("Response Data:", error.response.data); // Log the response data for debugging
        }
        if (error.response && error.response.status === 429) {
          // Rate limit exceeded
          await sleep(5000);
          retries++;
        } else {
          throw error; // Re-throw the error for other failures
        }
      }
    }
  }

  if (results.length === 0) {
    throw new Error("No articles found.");
  }

  return results; // Return the found articles
}

// Search endpoint
app.post("/search", async (req, res) => {
  try {
    const { topic, numPages, pageCap } = req.body;

    const articles = await searchGoogleCustomSearch(topic, numPages);
    if (!articles) {
      return res.status(404).send("No articles found.");
    }

    const cappedArticles = articles.map((article) => ({
      ...article,
      Content:
        article.Content.length > pageCap
          ? article.Content.slice(0, pageCap) + "..."
          : article.Content,
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(cappedArticles);
    fs.writeFileSync("ai_customs_brokerage_articles.csv", csv);

    return res.status(200).json(cappedArticles);
  } catch (error) {
    console.error(error); // Log error for debugging
    return res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
