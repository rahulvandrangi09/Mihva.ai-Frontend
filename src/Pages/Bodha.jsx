import React, { useState, useRef } from "react";
import '../Styles/bodha.css';
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

export default function Bodha() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! Upload a document (PDF or Word), and I'll analyze its contents for you." }
    ]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const chatContainerRef = useRef(null);
    
    // Reference to trigger the hidden file input
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

        const newMessages = [...messages];
        let userContent = input;
        if (file) {
            userContent = `[Attached Document: ${file.name}]\n${input}`;
        }

        newMessages.push({ role: "user", content: userContent });
        setMessages(newMessages);
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
                // Create new session if none exists or if a new file is uploaded
                const sessionRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ type: 'BODHA', documentId })
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
            <Navbar />
            {/* Background Layers */}
            <div className="space-layer stars-1"></div>
            <div className="space-layer stars-2"></div>
            <div className="space-layer nebula"></div>

            <div className="page-body">
                <Sidebar currentType="BODHA" onSelectSession={handleSelectSession} activeSessionId={sessionId} />
                <main className="chat-main">
                <div className="chat-heading-wrapper">
                    <div className="chat-heading">
                        <h1>AI Analysis</h1>
                        <div className="chat-brand">BODHA</div>
                    </div>
                </div>

                <div className="chat-messages" ref={chatContainerRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role} animate-fade-in-up`}>
                            <div className="message-name">{msg.role === "assistant" ? "Bodha AI" : "You"}</div>
                            <div className="message-content">
                                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message assistant animate-fade-in-up">
                            <div className="message-name">Bodha AI</div>
                            <div className="typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wrapped Input Area for Proper Alignment */}
                <div className="chat-input-container">
                    {file && (
                        <div className="file-preview-badge animate-fade-in-up">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file.name}</span>
                            <button onClick={handleRemoveFile} className="file-remove-btn" title="Remove file">✕</button>
                        </div>
                    )}
                    
                    <div className="chat-input-wrapper">
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button className="chat-attach-btn" onClick={() => fileInputRef.current.click()} title="Upload PDF or Word">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                            </svg>
                        </button>
                        
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message or upload a document..."
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button onClick={handleSend} disabled={!input.trim() && !file} className="chat-send-btn">
                            ➤
                        </button>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
}