import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/chatbot.css";
import "../Styles/login.css";
import Navbar from "../Components/Navbar";
export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
            } else {
                localStorage.setItem('token', json.token);
                localStorage.setItem('email', json.email);
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="ai-page">
            {/* Background Layers */}
            <Navbar />
            <div className="space-layer stars-1"></div>
            <div className="space-layer stars-2"></div>
            <div className="space-layer nebula"></div>

            <main className="auth-container">
                <div className="auth-glass-panel">
                    <div className="auth-header">
                        <h2>Join Bodha</h2>
                        <p>Initialize your learning workspace</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                        <div className="auth-input-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="auth-input-wrapper">
                                <input 
                                    type="text" 
                                    id="name"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <input 
                                    type="email" 
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="password">Create Password</label>
                            <div className="auth-input-wrapper">
                                <input 
                                    type="password" 
                                    id="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            Create Account
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Login Here</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}