import "../Styles/chatbot.css";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "../Components/Navbar"; 
import Sidebar from "../Components/Sidebar"; 

function Chatbot() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null); // Ref for auto-resizing the input

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    const handleSelectSession = async (id) => {
        setSessionId(id);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.map(m => ({
                    role: m.role.toLowerCase(),
                    content: m.content
                })));
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Auto-resize the textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        let currentSessionId = sessionId;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage,
            },
        ]);

        setMessage("");
        
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        
        setLoading(true);

        try {
            if (!currentSessionId) {
                const sessionRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'MIHVA' })
                });
                if(sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    currentSessionId = sessionData.id;
                    setSessionId(currentSessionId);
                }
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${currentSessionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error");
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.message,
                },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isTyping = message.trim().length > 0;

    return (
        <div className="ai-page">
            <div className="space-layer stars-1"></div>
            <div className="space-layer stars-2"></div>
            <div className="space-layer nebula"></div>

            <Navbar />

            <div className="page-body">
                <Sidebar currentType="MIHVA" onSelectSession={handleSelectSession} activeSessionId={sessionId} />
                <main className={`chat-main ${messages.length === 0 ? "empty-state" : ""} animate-fade-in-up`}>
                
                {messages.length === 0 ? (
                    /* Initial Landing View */
                    <div className="landing-view">
                        
                        <div className={`chat-heading-wrapper ${isTyping ? "hide-heading" : ""}`}>
                            <div className="chat-heading">
                                <h1>Meet Your Personalized Agent</h1>
                                <div className="chat-brand">Mihva.Ai</div>
                            </div>
                        </div>

                        <div className="chat-input-wrapper">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows="1"
                                placeholder={isTyping ? "" : "Ask Mihva anything..."}
                            />
                            <button onClick={sendMessage} disabled={loading || !message.trim()}>
                                ↗
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Active Chat View */
                    <>
                        <div className="chat-messages animate-fade-in-up" ref={chatContainerRef}>
                            {messages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.role}`}>
                                    <div className="message-name">
                                        {msg.role === "user" ? "You" : "Mihva"}
                                    </div>
                                    <div className="message-content">
                                        {msg.role === "assistant" ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="chat-message assistant loading-message">
                                    <div className="message-name">Mihva</div>
                                    <div className="typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="chat-input-wrapper active-input">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Command Mihva..."
                                rows="1"
                            />
                            <button onClick={sendMessage} disabled={loading || !message.trim()}>
                                ↗
                            </button>
                        </div>
                    </>
                )}
            </main>
            </div>

            <div className="bottom-section animate-slide-up">
                <p>Built with Enthusiasm</p>
            </div>
        </div>
    );
}

export default Chatbot;