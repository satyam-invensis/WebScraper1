import React, { useState } from "react";
import PropTypes from "prop-types";

const Results = ({ article }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleContent = () => {
    setExpanded(!expanded);
  };

  const getContentWithCapping = (content) => {
    const maxLength = 1000;
    return content.length > maxLength
      ? content.slice(0, maxLength) + "..."
      : content;
  };

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold">{article.Title}</h3>
      <p className="mt-4">
        {expanded ? article.Content : getContentWithCapping(article.Content)}
      </p>
      <button
        onClick={toggleContent}
        className="text-blue-500 hover:underline mt-2"
      >
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
};

Results.propTypes = {
  article: PropTypes.shape({
    Title: PropTypes.string.isRequired,
    Content: PropTypes.string.isRequired,
    Source: PropTypes.string.isRequired,
  }).isRequired,
};

export default Results;
