import React, { useState, useRef } from "react";
import "../Styles/chatbot.css";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

export default function Vidya() {
    const [messages, setMessages] = useState([
        { 
            role: "assistant", 
            content: "Welcome to Vidya. Upload a document (like a research paper on crop disease detection or API documentation), and I will help you break down and learn the concepts." 
        }
    ]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const chatContainerRef = useRef(null);
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
        if (!input.trim() && !file) return;

        let currentSessionId = sessionId;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }

        let userContent = input;
        if (file) {
            userContent = `[Attached for Learning: ${file.name}]\n${input}`;
        }

        setMessages(prev => [...prev, { role: "user", content: userContent }]);
        setInput("");
        setIsTyping(true);

        try {
            let documentId = null;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const docData = await uploadRes.json();
                if(uploadRes.ok) {
                    documentId = docData.id;
                } else {
                    alert(`Upload failed: ${docData.error || 'Unknown error'}`);
                    setIsTyping(false);
                    return;
                }
            }

            if (!currentSessionId || file) {
                const sessionRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'VIDYA', documentId })
                });
                if(sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    currentSessionId = sessionData.id;
                    setSessionId(currentSessionId);
                }
            }

            setFile(null); // Clear file after upload

            const chatRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${currentSessionId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userContent })
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
            <Navbar /> {/*[cite: 5] */}
            
            {/* Background Layers */}
            <div className="space-layer stars-1"></div> {/*[cite: 5] */}
            <div className="space-layer stars-2"></div> {/*[cite: 5] */}
            <div className="space-layer nebula"></div> {/*[cite: 5] */}

            <div className="page-body">
                <Sidebar currentType="VIDYA" onSelectSession={handleSelectSession} activeSessionId={sessionId} />
                <main className="chat-main animate-fade-in-up"> {/*[cite: 5] */}
                <div className="chat-heading-wrapper">
                    <div className="chat-heading">
                        <h1>Vidya</h1> {/*[cite: 5] */}
                        <div className="chat-brand">Interactive Learning</div>
                    </div>
                </div>

                <div className="chat-messages" ref={chatContainerRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role} animate-fade-in-up`}>
                            <div className="message-name">{msg.role === "assistant" ? "Vidya AI" : "You"}</div>
                            <div className="message-content">
                                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message assistant animate-fade-in-up">
                            <div className="message-name">Vidya AI</div>
                            <div className="typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wrapped Input Area for File Upload Alignment */}
                <div className="chat-input-container"> {/*[cite: 7] */}
                    {file && (
                        <div className="file-preview-badge animate-fade-in-up"> {/*[cite: 7] */}
                            <span className="file-icon">📄</span> {/*[cite: 7] */}
                            <span className="file-name">{file.name}</span> {/*[cite: 7] */}
                            <button onClick={handleRemoveFile} className="file-remove-btn" title="Remove file">✕</button> {/*[cite: 7] */}
                        </div>
                    )}
                    
                    <div className="chat-input-wrapper"> {/*[cite: 7] */}
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.txt"
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button className="chat-attach-btn" onClick={() => fileInputRef.current.click()} title="Upload Study Material"> {/*[cite: 7] */}
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                        </button>
                        
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question or upload a document to study..."
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend} disabled={!input.trim() && !file} className="chat-send-btn"> {/*[cite: 7] */}
                            ➤
                        </button>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
}