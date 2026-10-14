import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import aiAvatar from "../assets/ai-avatar.png";
import { askGeminiInterview } from "../api/gemini";

/* 🔊 Text-to-Speech */
function speak(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function Interview() {
  const navigate = useNavigate();

  const [step, setStep] = useState("timer"); // timer | interview
  const [selectedTime, setSelectedTime] = useState(null); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds

  const [chat, setChat] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (step !== "interview") return;

    if (timeLeft <= 0) {
      endInterview("Time Over");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, step]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  /* ================= INTERVIEW FLOW ================= */

  async function startInterview() {
    setStep("interview");
    setTimeLeft(selectedTime * 60);
    setLoading(true);

    const firstQ = await askGeminiInterview([
      {
        role: "user",
        text: "Start the interview by asking: Give me your introduction and tell me about your skills."
      }
    ]);

    setChat([{ role: "ai", text: firstQ }]);
    speak(firstQ);
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim() || loading) return;

    const updatedChat = [...chat, { role: "user", text: answer }];
    setChat(updatedChat);
    setAnswer("");
    setLoading(true);

    const nextQ = await askGeminiInterview([
      ...updatedChat,
      {
        role: "user",
        text:
          "Ask the next interview question. Mix all mentioned skills. Do not stick to one technology."
      }
    ]);

    setChat((prev) => [...prev, { role: "ai", text: nextQ }]);
    speak(nextQ);
    setLoading(false);
  }

  /* ================= END / STOP ================= */

  function endInterview(reason) {
    const history =
      JSON.parse(localStorage.getItem("interviewHistory")) || [];

    history.unshift({
      date: new Date().toLocaleString(),
      duration: `${selectedTime} min`,
      reason,
      totalQuestions: chat.filter((c) => c.role === "ai").length,
      chat
    });

    localStorage.setItem("interviewHistory", JSON.stringify(history));

    window.speechSynthesis.cancel();

    // 🔁 Redirect to history page
    navigate("/user/history");
  }

  /* ================= UI ================= */

  /* ⏱ TIMER SELECTION SCREEN */
  if (step === "timer") {
    return (
      <div className="page center page interview-page">
        <h2>Select Interview Duration</h2>

        <div className="timer-options">
          {[2, 3, 4].map((t) => (
            <button
              key={t}
              className={selectedTime === t ? "active" : ""}
              onClick={() => setSelectedTime(t)}
            >
              {t} Minutes
            </button>
          ))}
        </div>

        <button
          className="primary-btn"
          disabled={!selectedTime}
          onClick={startInterview}
        >
          Start Interview
        </button>
      </div>
    );
  }

  /* 🎤 INTERVIEW SCREEN */
  return (
    <div className="page">

      {/* 🔝 TOP BAR */}
      <div className="top-bar">
        <div className="timer-display">
          ⏱️ {formatTime(timeLeft)}
        </div>

        <button
          className="stop-btn"
          onClick={() => endInterview("Left by user")}
        >
          Stop Interview
        </button>
      </div>

      <div className="interview-layout">

        {/* LEFT PANEL */}
        <div className="card interview-panel">
          <div className="interview-header">
            <img src={aiAvatar} alt="AI" className="avatar-img" />
            <div>
              <h4>AI Interviewer</h4>
              <span className="live-status">● Live</span>
            </div>
          </div>

          <div className="question-section">
            <p className="question-label">Current Question</p>
            <p className="question-text">
              {chat.filter((c) => c.role === "ai").slice(-1)[0]?.text}
            </p>
          </div>

          <textarea
            className="answer-box"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <button
            className="secondary-btn"
            onClick={submitAnswer}
            disabled={loading}
          >
            {loading ? "AI Thinking..." : "Submit Answer"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="card chat-panel">
          <h3>Live Interview Log</h3>

          <div className="chat-box">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${
                  msg.role === "ai" ? "ai-bubble" : "user-bubble"
                }`}
              >
                <strong>{msg.role === "ai" ? "AI" : "You"}:</strong>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Interview;
