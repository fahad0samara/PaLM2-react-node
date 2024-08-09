import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";
import { FaPaperPlane, FaBars, FaTimes, FaTrash, FaPlus } from "react-icons/fa";

marked.use({
  gfm: true,
});

function App() {
  const [serverData, setServerData] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const inputRef = useRef(null);
  const conversationEndRef = useRef(null); // Reference for the conversation end

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(storedHistory);
  }, []);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serverData]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      inputRef.current.blur();
      handleSubmit();
    }
  }

  async function handleSubmit() {
    if (userPrompt.trim() === "") return;

    setLoading(true);
    setServerData("");

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();

      if (response.ok) {
        const answerText = data.answer || "";
        const sanitizedHtml = DOMPurify.sanitize(marked(answerText));
        setServerData(sanitizedHtml);

        const newEntry = {
          prompt: userPrompt,
          response: sanitizedHtml,
        };

        let updatedHistory = [...history];
        let updatedConversationId = currentConversationId;

        const conversationIndex = updatedHistory.findIndex(
          (convo) => convo.conversationId === currentConversationId
        );

        if (conversationIndex > -1) {
          // Update existing conversation
          updatedHistory[conversationIndex].entries.push(newEntry);
        } else {
          // Create new conversation
          updatedConversationId = uuidv4();
          updatedHistory.push({
            conversationId: updatedConversationId,
            entries: [newEntry],
          });
        }

        setHistory(updatedHistory);
        setCurrentConversationId(updatedConversationId);
        localStorage.setItem("history", JSON.stringify(updatedHistory));

        const conversationHtml = updatedHistory
          .find((convo) => convo.conversationId === updatedConversationId)
          .entries.map(
            (entry) => `
              <div class="chat-entry">
                <div class="chat-prompt"><strong>Prompt:</strong> ${entry.prompt}</div>
                <div class="chat-response"><strong>Response:</strong> ${entry.response}</div>
              </div>
            `
          )
          .join("");
        setServerData(conversationHtml);
      } else {
        setServerData("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setServerData("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setUserPrompt("");
      inputRef.current.focus();
    }
  }

  function handleHistoryClick(conversationId) {
    const selectedConversation = history.find(
      (convo) => convo.conversationId === conversationId
    );
    if (selectedConversation) {
      const conversationHtml = selectedConversation.entries
        .map(
          (entry) => `
            <div class="chat-entry">
              <div class="chat-prompt"><strong>Prompt:</strong> ${entry.prompt}</div>
              <div class="chat-response"><strong>Response:</strong> ${entry.response}</div>
            </div>
          `
        )
        .join("");
      setServerData(conversationHtml);
    }
    setCurrentConversationId(conversationId);
  }

  function handleDelete(conversationId) {
    const updatedHistory = history.filter(
      (convo) => convo.conversationId !== conversationId
    );
    setHistory(updatedHistory);
    localStorage.setItem("history", JSON.stringify(updatedHistory));

    // Clear current conversation if it's deleted
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setServerData("");
    }
  }

  function handleNewConversation() {
    // Create a new conversation ID and clear the current conversation state
    const newConversationId = uuidv4();
    setCurrentConversationId(newConversationId);
    setServerData(""); // Clear the displayed conversation data
  }

  function getFirstThreeWords(text) {
    return (
      text.split(" ").slice(0, 4).join(" ") +
      (text.split(" ").length > 4 ? "" : "")
    );
  }

  const mainStyle = {
    ...styles.main,
    marginLeft: sidebarOpen ? "250px" : "0",
  };

  return (
    <div style={styles.container}>
      <div style={sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}>
        <h2 style={styles.sidebarTitle}>History</h2>
        <button
          onClick={() => handleNewConversation()}
          style={styles.newConversationButton}
        >
          <FaPlus style={styles.newConversationIcon} />
        </button>
        <ul style={styles.historyList}>
          {history.map((convo, index) => (
            <li
              key={index}
              style={styles.historyItem}
              onClick={() => handleHistoryClick(convo.conversationId)}
            >
              <div style={styles.historyContent}>
                {convo.entries.length > 0 ? (
                  <div className="conversation-summary">
                    {getFirstThreeWords(
                      convo.entries[convo.entries.length - 1].prompt
                    )}
                  </div>
                ) : (
                  "No Entries"
                )}
              </div>
              <h3
                style={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from triggering handleHistoryClick
                  handleDelete(convo.conversationId);
                }}
              >
                <FaTrash style={styles.deleteIcon} />
              </h3>
            </li>
          ))}
        </ul>
      </div>
      <main style={mainStyle}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={styles.toggleButton}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 style={styles.heading}>MyPrompter</h1>
        <div style={styles.content}>
          <div style={styles.innerContent}>
            {loading ? (
              <div style={styles.loading}>Loading...</div>
            ) : (
              <article
                style={styles.article}
                dangerouslySetInnerHTML={{ __html: serverData }}
              />
            )}
            <div ref={conversationEndRef} /> {/* Scroll to this element */}
          </div>
        </div>
        <div style={styles.footer}>
          <div style={styles.textareaContainer}>
            <textarea
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              value={userPrompt}
              style={styles.textarea}
              placeholder="Type in Prompt..."
            />
            <button onClick={handleSubmit} style={styles.submitButton}>
              <FaPaperPlane style={styles.icon} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebarOpen: {
    position: "fixed",
    left: 0,
    top: 0,
    width: "250px",
    backgroundColor: "#111",
    color: "#fff",
    padding: "10px",
    height: "100%",
    transition: "width 0.3s ease",
    zIndex: 2,
  },
  sidebarClosed: {
    position: "fixed",
    left: 0,
    top: 0,
    width: "0",
    backgroundColor: "#111",
    color: "#fff",
    overflow: "hidden",
    height: "100%",
    transition: "width 0.3s ease",
    zIndex: 2,
  },
  sidebarTitle: {
    color: "#1abc9c",
    textAlign: "center",
    marginBottom: "10px",
  },
  historyList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  historyItem: {
    display: "flex",
    padding: "1px",
    borderBottom: "1px solid #333",
    margin: 0,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  historyContent: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ff0000",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
  },
  deleteIcon: {
    fontSize: "0.8em", // Smaller icon size
  },

  newConversationButton: {
    backgroundColor: "#1abc9c",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
    width: "100%",
  },
  newConversationIcon: {
    fontSize: "1.5em",
  },
  noHistory: {
    color: "#ccc",
    textAlign: "center",
    padding: "10px",
  },
  main: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "'Roboto', sans-serif",
    transition: "margin-left 0.3s ease",
  },
  toggleButton: {
    padding: "10px",
    margin: "10px",
    backgroundColor: "#1abc9c",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    left: "10px",
    top: "10px",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    padding: "10px",
    marginBottom: "0",
    color: "#1abc9c",
    textAlign: "center",
  },
  content: {
    margin: "0",
    flexGrow: "1",
    overflow: "scroll",
  },
  innerContent: {
    width: "100%",
    height: "100%",
  },
  article: {
    margin: "0",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.2em",
    color: "#1abc9c",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#222",
    padding: "10px",
  },
  textareaContainer: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#333",
    borderRadius: "10px",
  },
  textarea: {
    flexGrow: 1,
    padding: "10px",
    fontSize: "1em",
    borderRadius: "20px",
    border: "none",
    resize: "none",
    backgroundColor: "#444",
    color: "#fff",
    marginRight: "10px",
  },
  submitButton: {
    backgroundColor: "#1abc9c",
    color: "#000",
    padding: "10px",
    fontSize: "1.2em",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
  },
  icon: {
    fontSize: "1.2em",
  },
};

export default App;
