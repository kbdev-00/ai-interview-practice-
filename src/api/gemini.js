/**
 * Gemini Interview API (Frontend)
 * --------------------------------
 * This file ONLY talks to your Node backend.
 * No API key here.
 * Safe to push on GitHub.
 */

const BACKEND_URL = "https://gemini-api-zb6t.onrender.com/api/interview";

/**
 * Send interview chat history to backend
 * @param {Array<{role: string, text: string}>} chatHistory
 * @returns {Promise<string>} AI reply
 */
export async function askGeminiInterview(chatHistory) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chatHistory
      })
    });

    if (!res.ok) {
      // Backend error (429, 500, etc.)
      console.error("Backend error:", res.status);
      return "Sorry, I am facing some issue. Please continue after a moment.";
    }

    const data = await res.json();

    // Safety fallback
    if (!data || !data.reply) {
      return "Could you please continue?";
    }

    return data.reply;
  } catch (error) {
    console.error("Failed to connect to backend:", error);
    return "Network issue. Please check your connection and try again.";
  }
}
