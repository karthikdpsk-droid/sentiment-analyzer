const API_URL = "http://localhost:5000/api";

// Analyze text
async function analyzeText() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    showError("Please enter some text to analyze!");
    return;
  }

  hideError();
  showLoading(true);
  hideResult();

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (data.success) {
      showResult(data.data);
      loadHistory();
    } else {
      showError(data.message || "Analysis failed!");
    }
  } catch (error) {
    showError("Cannot connect to server. Make sure server is running!");
  } finally {
    showLoading(false);
  }
}

// Show result
function showResult(data) {
  const resultCard = document.getElementById("resultCard");
  const resultBox = document.getElementById("resultBox");

  document.getElementById("resultEmoji").textContent = data.emoji;
  document.getElementById("resultSentiment").textContent = data.sentiment;
  document.getElementById("resultSentiment").className = `sentiment-label ${data.sentiment.toLowerCase()}`;
  document.getElementById("resultScore").textContent = `Score: ${data.score}`;
  document.getElementById("resultPercentage").textContent = `Confidence: ${data.percentage}`;
  document.getElementById("resultText").textContent = `"${data.text}"`;

  resultCard.className = `card result-card result-${data.sentiment.toLowerCase()}`;
  resultCard.style.display = "block";

  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Load history
async function loadHistory() {
  try {
    const response = await fetch(`${API_URL}/history`);
    const data = await response.json();

    const container = document.getElementById("historyContainer");

    if (data.data.length === 0) {
      container.innerHTML = '<p class="no-history">No analysis history yet. Analyze some text to get started!</p>';
      return;
    }

    container.innerHTML = data.data.map(item => `
      <div class="history-item" id="item-${item._id}">
        <div class="history-left">
          <div class="history-text">${escapeHtml(item.text)}</div>
          <div class="history-meta">
            <span class="badge badge-${item.sentiment.toLowerCase()}">${item.emoji} ${item.sentiment}</span>
            <span class="badge" style="background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3)">Score: ${item.score}</span>
            <span class="badge" style="background:rgba(168,85,247,0.15);color:#d8b4fe;border:1px solid rgba(168,85,247,0.3)">${item.percentage}</span>
            <span class="history-date">${formatDate(item.createdAt)}</span>
          </div>
        </div>
        <button class="delete-btn" onclick="deleteItem('${item._id}')">🗑️ Delete</button>
      </div>
    `).join("");
  } catch (error) {
    console.error("Failed to load history:", error);
  }
}

// Delete single item
async function deleteItem(id) {
  try {
    const response = await fetch(`${API_URL}/history/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (data.success) {
      document.getElementById(`item-${id}`).remove();
      const container = document.getElementById("historyContainer");
      if (container.children.length === 0) {
        container.innerHTML = '<p class="no-history">No analysis history yet. Analyze some text to get started!</p>';
      }
    }
  } catch (error) {
    showError("Failed to delete!");
  }
}

// Clear all history
async function clearHistory() {
  if (!confirm("Are you sure you want to clear all history?")) return;
  try {
    const response = await fetch(`${API_URL}/history`, { method: "DELETE" });
    const data = await response.json();
    if (data.success) {
      document.getElementById("historyContainer").innerHTML =
        '<p class="no-history">No analysis history yet. Analyze some text to get started!</p>';
    }
  } catch (error) {
    showError("Failed to clear history!");
  }
}

// Clear input
function clearInput() {
  document.getElementById("textInput").value = "";
  hideResult();
  hideError();
}

// Helper functions
function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}

function hideResult() {
  document.getElementById("resultCard").style.display = "none";
}

function showError(msg) {
  const errorBox = document.getElementById("errorBox");
  document.getElementById("errorMsg").textContent = "⚠️ " + msg;
  errorBox.style.display = "block";
  setTimeout(() => errorBox.style.display = "none", 4000);
}

function hideError() {
  document.getElementById("errorBox").style.display = "none";
}

function escapeHtml(text) {
  return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// Allow Enter key to analyze
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  document.getElementById("textInput").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") analyzeText();
  });
});
