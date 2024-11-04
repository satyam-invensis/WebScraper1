import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faDownload,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [numPages, setNumPages] = useState(100);
  const [pageCap, setPageCap] = useState(1000);
  const [downloadLink, setDownloadLink] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [sampleTopics, setSampleTopics] = useState([]);

  const allSampleTopics = [
    "Climate Change",
    "Artificial Intelligence",
    "Quantum Computing",
    "Space Exploration",
    "Renewable Energy",
    "Genetic Engineering",
    "Blockchain Technology",
    "Cybersecurity",
    "Robotic Automation",
    "Artificial Life",
    "Quantum Physics",
    "Genetic Algorithms",
    "Cybercrime",
    "Augmented Reality",
    "Mental Health",
    "Biotechnology",
    "Nanotechnology",
    "Smart Cities",
    "3D Printing",
    "Internet of Things",
    "Sustainable Agriculture",
    "Data Science",
    "Telemedicine",
    "Financial Technology",
    "Bioinformatics",
    "Virtual Reality",
    "Robotics",
    "Machine Learning",
  ];

  useEffect(() => {
    const getRandomSamples = () => {
      const shuffled = [...allSampleTopics].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    };
    setSampleTopics(getRandomSamples());
  }, []);

  const handleSearch = async () => {
    if (!topic) {
      setError("Topic cannot be empty.");
      return;
    }

    if (![100, 200, 300, 500, 1000].includes(numPages)) {
      setError(
        "Number of articles must be one of the following: 100, 200, 300, 500, or 1000."
      );
      return;
    }

    if (pageCap < 1) {
      setError("Capping must be at least 1.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompleted(false);

    try {
      const response = await axios.post("http://localhost:3000/search", {
        topic,
        numPages,
        pageCap,
      });
      setResult(
        response.data.map((article) => ({ ...article, showFullContent: false }))
      );
      setDownloadLink("/download-csv");
      setCompleted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error.response?.data.error ||
          "Failed to fetch results. Please try again."
      );
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  const getContentWithCapping = (content) => {
    if (!content || typeof content !== "string") return "";
    return content.length > pageCap
      ? content.slice(0, pageCap) + "..."
      : content;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-pink-800 to-green-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Web Scraper
        </h2>
        <div className="flex flex-col gap-5">
          <div className="flex items-center mb-4">
            <label
              htmlFor="topic"
              className="text-base font-medium text-gray-700 mr-2"
            >
              Topic:
            </label>
            <div className="relative flex-grow">
              <input
                type="text"
                id="topic"
                className="border border-gray-300 p-3 rounded-lg bg-gray-50 pl-10 w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                placeholder="Enter Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Search topic"
                disabled={loading}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                onClick={() => setTopic(sample)}
                className="border border-blue-500 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition duration-300 w-full"
              >
                {sample}
              </button>
            ))}
          </div>
          <div className="flex items-center mb-4">
            <label className="text-base font-medium text-gray-700 mr-2">
              No of Articles:
            </label>
            <div className="flex space-x-2">
              {[100, 200, 300, 500, 1000].map((num) => (
                <button
                  key={num}
                  className={`border border-gray-300 p-2 rounded-lg font-semibold transition duration-300 ${
                    num === numPages
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  } w-full`}
                  onClick={() => setNumPages(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center mb-4">
            <label
              htmlFor="pageCap"
              className="text-base font-medium text-gray-700 mr-2"
            >
              Capping:
            </label>
            <input
              type="number"
              id="pageCap"
              className="border border-gray-300 p-3 rounded-lg bg-gray-50 w-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              value={pageCap}
              onChange={(e) => setPageCap(Number(e.target.value))}
              min={1}
              aria-label="Max pages cap"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleSearch}
              className="flex-1 border border-blue-500 p-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition duration-300 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <img
                  src="https://aceyourpaper.com/essays/public/images/loader.gif"
                  alt="Loading"
                  className="w-6 h-6 inline"
                />
              ) : completed ? (
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
              )}
              {loading ? " Searching..." : completed ? " Completed" : " Search"}
            </button>
            {downloadLink && (
              <a
                href={downloadLink}
                className="flex items-center border border-green-500 p-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition duration-300 shadow-md ml-2"
                download
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download CSV
              </a>
            )}
          </div>
          {error && (
            <p className="text-red-600 mt-2 text-center" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={() => navigate("/upload")}
            className="mt-4 border border-blue-500 p-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition duration-300 shadow-lg"
          >
            Already have a file? Upload Now
          </button>
        </div>
        {result.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg">Results:</h3>
            {result.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-300 rounded-lg my-2"
              >
                <h4 className="font-bold">{item.Title}</h4>
                <p>{getContentWithCapping(item.Content)}</p>
                {item.Content && item.Content.length > pageCap && (
                  <button
                    onClick={() => {
                      const updatedResult = result.map((res, idx) => {
                        if (idx === index) {
                          return {
                            ...res,
                            showFullContent: !res.showFullContent,
                          };
                        }
                        return res;
                      });
                      setResult(updatedResult);
                    }}
                    className="mt-2 text-blue-600 font-semibold hover:bg-blue-100 rounded-lg p-2 transition duration-300"
                  >
                    {result[index].showFullContent ? "Show Less" : "Read More"}
                  </button>
                )}
                {item.showFullContent && <p className="mt-2">{item.Content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
