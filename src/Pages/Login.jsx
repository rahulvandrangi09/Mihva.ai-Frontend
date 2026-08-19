// login file
import React, { useState } from "react";
import "../Styles/chatbot.css"; // Imports the background layers and base variables
import "../Styles/login.css";    // Imports the specific form styling
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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
                        <h2>Welcome Back</h2>
                        <p>Access the Bodha AI System</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
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
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <input 
                                    type="password" 
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            Initialize Login
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an access key? <Link to="/signup" className="auth-link">Register Here</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}