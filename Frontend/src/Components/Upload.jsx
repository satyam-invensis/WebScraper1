import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faFileUpload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [command, setCommand] = useState("summarize it"); // Default command
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file || !command) {
      alert("Please upload a file and enter a command.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("command", command);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const apiOutput = response.data.output;
      setOutput(
        typeof apiOutput === "string"
          ? apiOutput
          : JSON.stringify(apiOutput, null, 2)
      );
    } catch (error) {
      console.error("Error calling server API:", error);
      if (error.response) {
        setErrorMessage(
          `Error: ${
            error.response.data.error || "An unexpected error occurred."
          }`
        );
      } else {
        setErrorMessage("Network error or timeout.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.background = "whitesmoke";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 border border-gray-200">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-600">
        Upload Your File & Ask a Question
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-6 p-6 rounded-lg shadow-lg bg-gradient-to-br from-purple-500 to-pink-500"
      >
        <div className="flex items-center mb-4">
          <label className="flex-1 relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="File Upload"
            />
            <span className="block border-2 border-gray-400 rounded-lg p-3 flex items-center justify-between hover:border-purple-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600">
              {file ? (
                file.name
              ) : (
                <button className="flex items-center text-white cursor-pointer">
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="mr-2 text-2xl"
                  />
                  Upload File
                </button>
              )}
            </span>
          </label>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Enter your command..."
            value={command}
            onChange={handleCommandChange}
            className="border-2 border-transparent rounded-lg p-3 mb-2 hover:border-purple-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
          Submit
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-2" />
          <span>Loading...</span>
        </div>
      )}
      {output && (
        <div
          className="mt-6 p-4 border rounded-lg shadow-lg"
          style={{ backgroundColor: "#e0f7fa" }} // Light teal background
        >
          <h3 className="text-lg font-bold text-gray-800">Output:</h3>
          <div
            className="bg-white p-4 rounded-lg shadow-inner"
            style={{ backgroundColor: "#fafafa" }} // Slightly darker white for contrast
          >
            <pre className="whitespace-pre-wrap text-gray-700">
              {output.replace(/[#*]/g, "")}
            </pre>
          </div>
        </div>
      )}

      <p className="text-center text-gray-600 mt-4">
        Drag & drop files or click to upload
      </p>
    </div>
  );
};

export default Upload;
