import React, { useState, useRef } from "react";
import "../Styles/chatbot.css";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

export default function Abhyas() {
    const [messages, setMessages] = useState([
        { 
            role: "assistant", 
            content: "Welcome to the Abhyas Interview Module. Let's begin. How would you approach designing a scalable backend system for real-time presence tracking and status updates?" 
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const chatContainerRef = useRef(null);

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
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        let currentSessionId = sessionId;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            if (!currentSessionId) {
                const sessionRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'ABHYAS' })
                });
                if(sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    currentSessionId = sessionData.id;
                    setSessionId(currentSessionId);
                }
            }

            const chatRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${currentSessionId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: input })
            });
            const chatData = await chatRes.json();

            setMessages(prev => [...prev, {
                role: "assistant",
                content: chatData.message || "An error occurred"
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="ai-page">
            <Navbar /> {/*[cite: 4] */}
            
            {/* Background Layers */}
            <div className="space-layer stars-1"></div> {/*[cite: 4] */}
            <div className="space-layer stars-2"></div> {/*[cite: 4] */}
            <div className="space-layer nebula"></div> {/*[cite: 4] */}

            <div className="page-body">
                <Sidebar currentType="ABHYAS" onSelectSession={handleSelectSession} activeSessionId={sessionId} />
                <main className="chat-main animate-fade-in-up"> {/*[cite: 4] */}
                <div className="chat-heading-wrapper">
                    <div className="chat-heading">
                        <h1>Abhyas</h1> {/*[cite: 4] */}
                        <div className="chat-brand">Mock Interview</div>
                    </div>
                </div>

                <div className="chat-messages" ref={chatContainerRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role} animate-fade-in-up`}>
                            <div className="message-name">{msg.role === "assistant" ? "Interviewer AI" : "You"}</div>
                            <div className="message-content">
                                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message assistant animate-fade-in-up">
                            <div className="message-name">Interviewer AI</div>
                            <div className="typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend} disabled={!input.trim()} className="chat-send-btn">
                            ➤
                        </button>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
}