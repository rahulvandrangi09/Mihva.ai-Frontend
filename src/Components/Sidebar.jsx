import React, { useState, useEffect } from 'react';
import '../Styles/sidebar.css';
import { FiMessageSquare, FiFileText, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Sidebar = ({ currentType, onSelectSession, activeSessionId }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const fetchSessions = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Only show sessions of the current page type
                    const filteredSessions = data.filter(s => s.type === currentType);
                    setSessions(filteredSessions);
                }
            } catch (error) {
                console.error("Failed to fetch sessions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [currentType]);

    return (
        <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <h3>Chat History</h3>}
                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>
            
            {!collapsed && (
                <div className="sidebar-content">
                    {loading ? (
                        <div className="sidebar-loading">Loading...</div>
                    ) : sessions.length === 0 ? (
                        <div className="no-sessions">
                            <FiClock className="empty-icon" />
                            <p>No previous chats</p>
                        </div>
                    ) : (
                        <ul className="session-list">
                            {sessions.map(session => (
                                <li 
                                    key={session.id} 
                                    className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
                                    onClick={() => onSelectSession(session.id)}
                                >
                                    {session.document ? (
                                        <FiFileText className="session-icon" />
                                    ) : (
                                        <FiMessageSquare className="session-icon" />
                                    )}
                                    <div className="session-details">
                                        <span className="session-name">
                                            {session.document ? session.document.fileName : `Chat ${new Date(session.createdAt).toLocaleDateString()}`}
                                        </span>
                                        <span className="session-date">
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
