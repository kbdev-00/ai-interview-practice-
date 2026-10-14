import { useEffect, useState } from "react";

function InterviewHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("interviewHistory") || "[]"
    );
    setHistory(data);
  }, []);

  if (!history.length) {
    return <p>No interview history found.</p>;
  }

  return (
    <div className="page">
      <h2>Interview History</h2>

      {history.map((item, index) => (
        <div key={index} className="card">
          <p><strong>Date:</strong> {item.date}</p>
          <p><strong>Duration:</strong> {item.duration}</p>
          <p><strong>Questions:</strong> {item.totalQuestions}</p>

          <details>
            <summary>View Responses</summary>
            {item.chat.map((c, i) => (
              <p key={i}>
                <strong>{c.role === "ai" ? "AI" : "You"}:</strong>{" "}
                {c.text}
              </p>
            ))}
          </details>
        </div>
      ))}
    </div>
  );
}

export default InterviewHistory;
