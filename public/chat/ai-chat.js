document.addEventListener('DOMContentLoaded', function () {
    (function () {
        // --- CONFIGURATION ---
        const BACKEND_URL = (window.MOLLAI_CONFIG && window.MOLLAI_CONFIG.apiUrl) ? window.MOLLAI_CONFIG.apiUrl : "https://chat-ruddy-three.vercel.app";
        const CHAT_TITLE = "MollAI Chat";
        const BOT_NAME = "MollAI";

        // Colors matching the site design system
        const C = {
            bg: '#E2E1DD',
            bgLight: '#F5F4F2',
            bgDarker: '#D5D4D0',
            textPrimary: '#2C2C2C',
            textSecondary: '#5E5E5E',
            textMuted: '#8E8E8E',
            accentGreen: '#3BB8B0',
            accentRed: '#D44A4F',
            shadowRaised: '4px 4px 8px rgba(0,0,0,0.12), -4px -4px 8px rgba(255,255,255,0.6)',
            shadowFloat: '6px 6px 12px rgba(0,0,0,0.14), -6px -6px 12px rgba(255,255,255,0.64)',
            shadowInset: 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.6)',
        };

        const AVATAR_URL = `/assets/avatar/image.png`;

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

            /* Chat trigger button - always visible */
            #chat-trigger {
                position: fixed; bottom: 25px; right: 32px;
                width: 60px; height: 60px;
                border-radius: 18px;
                background: ${C.bg};
                box-shadow: ${C.shadowRaised};
                border: none;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                z-index: 99998;
                transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            #chat-trigger:hover {
                transform: translateY(-2px);
                box-shadow: ${C.shadowFloat};
            }
            #chat-trigger svg { width: 28px; height: 28px; fill: ${C.accentGreen}; }

            /* Green online dot */
            .trigger-online-dot {
                position: absolute; top: 8px; right: 8px;
                width: 14px; height: 14px;
                background-color: ${C.accentGreen};
                border-radius: 50%;
                border: 3px solid ${C.bg};
                box-shadow: 0 0 6px rgba(59,184,176,0.4);
            }

            /* Main widget panel */
            #ai-chat-widget {
                position: fixed; bottom: 95px; right: 32px;
                width: 380px; height: 600px; max-height: calc(100vh - 120px);
                background: ${C.bg};
                border-radius: 26px;
                border: 2px solid rgba(59,184,176,0.15);
                box-shadow: ${C.shadowFloat};
                display: none; flex-direction: column;
                padding: 0;
                box-sizing: border-box;
                z-index: 99999;
                font-family: 'Inter', sans-serif;
                overflow: hidden;
            }
            #ai-chat-widget.active {
                display: flex;
                animation: chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1);
            }
            @keyframes chatSlideUp {
                from { opacity: 0; transform: translateY(20px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* Close button */
            .chat-close-btn {
                position: absolute; top: 14px; left: 14px;
                width: 32px; height: 32px;
                border-radius: 10px;
                background: ${C.bg};
                box-shadow: ${C.shadowRaised};
                border: none;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                font-size: 16px; color: ${C.textMuted};
                transition: all 0.2s ease;
                z-index: 10;
                line-height: 1;
            }
            .chat-close-btn:hover {
                color: ${C.accentRed};
                box-shadow: ${C.shadowFloat};
                transform: translateY(-1px);
            }
            .chat-close-btn:active {
                transform: scale(0.95);
                box-shadow: ${C.shadowInset};
            }

            /* Chat header */
            .header-chat {
                display: flex; flex-direction: column; align-items: center;
                padding: 24px 20px 20px;
                background: ${C.bg};
                position: relative;
            }
            .header-chat::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 75%;
                height: 1px;
                background: rgba(0,0,0,0.06);
            }
            .avatar-chat {
                width: 64px; height: 64px;
                border-radius: 18px;
                box-shadow: ${C.shadowRaised};
                display: flex; align-items: center; justify-content: center;
                margin-bottom: 12px;
                background: ${C.bg};
                position: relative;
            }
            .avatar-chat .inner {
                width: 48px; height: 48px;
                border-radius: 50%;
                box-shadow: ${C.shadowInset};
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                background: ${C.bg};
            }
            .avatar-chat .inner img { width: 100%; height: 100%; object-fit: cover; }
            .header-online-dot {
                position: absolute; bottom: 2px; right: 2px;
                width: 12px; height: 12px;
                background-color: ${C.accentGreen};
                border-radius: 50%;
                border: 2px solid ${C.bg};
                z-index: 2;
            }
            .header-chat h3 {
                margin: 0; font-weight: 700; font-size: 18px;
                color: ${C.textPrimary}; letter-spacing: -0.3px;
            }
            .header-chat p {
                margin: 2px 0 0; font-size: 12px; font-weight: 600;
                color: ${C.accentGreen};
            }

            /* Messages area */
            .messages-chat {
                flex: 1; padding: 16px;
                overflow-y: auto;
                display: flex; flex-direction: column; gap: 14px;
                scrollbar-width: thin;
                scrollbar-color: ${C.bgDarker} transparent;
                position: relative;
                z-index: 2;
            }
            .messages-chat::-webkit-scrollbar { width: 6px; }
            .messages-chat::-webkit-scrollbar-track { background: transparent; }
            .messages-chat::-webkit-scrollbar-thumb {
                background: ${C.bgDarker}; border-radius: 3px;
            }

            /* Logo watermark - fixed center, behind messages */
            .chat-watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 130px;
                opacity: 0.07;
                pointer-events: none;
                z-index: 1;
            }
            .chat-watermark img {
                width: 100%;
                height: auto;
            }

            /* Message containers */
            .msg-container {
                display: flex; gap: 10px;
                align-items: flex-end;
                animation: msgFade 0.3s ease-out;
            }
            .msg-container.user { justify-content: flex-end; }
            @keyframes msgFade {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .msg-avatar {
                width: 32px; height: 32px;
                border-radius: 10px;
                box-shadow: ${C.shadowRaised};
                overflow: hidden; flex-shrink: 0;
                background: ${C.bg};
            }
            .msg-avatar img { width: 100%; height: 100%; object-fit: cover; }

            /* Message bubbles */
            .msg-bubble {
                padding: 12px 18px;
                border-radius: 10px;
                font-size: 14px;
                max-width: 80%;
                line-height: 1.6;
                font-weight: 400;
                white-space: pre-wrap;
            }
            .msg-bubble.bot {
                background: ${C.bg};
                box-shadow: ${C.shadowRaised};
                color: ${C.textPrimary};
                border-bottom-left-radius: 18px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                border-bottom-right-radius: 10px;
            }
            .msg-bubble.user {
                background: linear-gradient(135deg, ${C.accentGreen}, #2EA89E);
                color: white;
                box-shadow: 0 4px 12px rgba(59,184,176,0.3);
                border-bottom-right-radius: 18px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                border-bottom-left-radius: 10px;
            }

            /* Typing indicator */
            .typing-indicator {
                font-size: 12px;
                color: ${C.textMuted};
                padding: 0 16px 8px;
                display: none;
                font-style: italic;
            }

            /* Footer / input area */
            .footer-chat {
                padding: 12px 16px 16px;
                display: flex; gap: 10px; align-items: center;
                background: ${C.bg};
                position: relative;
            }
            .footer-chat::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 75%;
                height: 1px;
                background: rgba(0,0,0,0.06);
            }
            .input-box {
                flex: 1; height: 46px;
                box-sizing: border-box;
                background: ${C.bg};
                box-shadow: ${C.shadowInset};
                border-radius: 23px;
                padding: 0 18px;
                border: none; outline: none;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                color: ${C.textPrimary};
                transition: box-shadow 0.2s ease;
            }
            .input-box::placeholder { color: ${C.textMuted}; }
            .input-box:focus {
                box-shadow: ${C.shadowInset}, 0 0 0 2px rgba(59,184,176,0.2);
            }
            .send-btn {
                width: 46px; height: 46px;
                border-radius: 50%;
                border: none;
                background: ${C.bg};
                box-shadow: ${C.shadowRaised};
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: transform 0.15s ease, box-shadow 0.15s ease;
                flex-shrink: 0;
            }
            .send-btn:hover {
                transform: translateY(-1px);
                box-shadow: ${C.shadowFloat};
            }
            .send-btn:active {
                transform: scale(0.95);
            }
            .send-btn svg { width: 20px; height: 20px; fill: ${C.accentGreen}; }

            /* Mobile responsive */
            @media (max-width: 480px) {
                #ai-chat-widget {
                    width: calc(100% - 20px);
                    right: 10px;
                    bottom: 90px;
                    height: calc(100vh - 110px);
                    border-radius: 20px;
                }
                #chat-trigger {
                    bottom: 20px; right: 20px;
                    width: 56px; height: 56px;
                }
            }
        `;
        document.head.appendChild(style);

        const widgetHTML = `
            <button id="chat-trigger">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                <div class="trigger-online-dot"></div>
            </button>
            <div id="ai-chat-widget">
                <div class="chat-watermark"><img src="assets/logo/logo black.svg" alt=""></div>
                <button class="chat-close-btn" id="chat-close" title="Закрыть">&#x2715;</button>
                <div class="header-chat">
                    <div class="avatar-chat">
                        <div class="inner"><img src="${AVATAR_URL}"></div>
                        <div class="header-online-dot"></div>
                    </div>
                    <h3>${CHAT_TITLE}</h3>
                    <p>Онлайн</p>
                </div>
                <div class="messages-chat" id="chat-messages"></div>
                <div class="typing-indicator" id="typing-indicator">${BOT_NAME} печатает...</div>
                <div class="footer-chat">
                    <input type="text" class="input-box" id="chat-input" placeholder="Напишите сообщение...">
                    <button class="send-btn" id="chat-send">
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = widgetHTML;
        document.body.appendChild(container);

        // Elements
        const trigger = document.getElementById('chat-trigger');
        const widget = document.getElementById('ai-chat-widget');
        const closeBtn = document.getElementById('chat-close');
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');
        const messages = document.getElementById('chat-messages');
        const typing = document.getElementById('typing-indicator');

        let isWidgetOpen = false;

        function openChat() {
            isWidgetOpen = true;
            widget.classList.add('active');
            scrollToBottom();
            setTimeout(scrollToBottom, 100);
            input.focus();
        }

        function closeChat() {
            isWidgetOpen = false;
            widget.classList.remove('active');
        }

        function toggleChat() {
            isWidgetOpen ? closeChat() : openChat();
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!isWidgetOpen) return;
            if (widget.contains(e.target)) return;
            closeChat();
        });

        // Close button
        closeBtn.onclick = (e) => { e.stopPropagation(); closeChat(); };

        // Trigger button
        trigger.onclick = (e) => { e.stopPropagation(); toggleChat(); };

        // Send message
        sendBtn.onclick = sendMessage;
        input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

        // --- Session & History ---
        function getSessionId() {
            let sid = localStorage.getItem('ai_chat_sid');
            if (!sid) {
                sid = 'session_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('ai_chat_sid', sid);
            }
            return sid;
        }

        async function loadHistory() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/history/${getSessionId()}`);
                const data = await res.json();
                if (data.history) {
                    messages.innerHTML = '';
                    data.history.forEach(m => addMessage(m.text, m.type, false));
                    // Scroll to bottom after history loaded
                    requestAnimationFrame(() => {
                        messages.scrollTop = messages.scrollHeight;
                    });
                }
            } catch (e) { console.error('History Error'); }
        }

        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            input.value = '';
            addMessage(text, 'user');
            typing.style.display = 'block';
            messages.scrollTop = messages.scrollHeight;
            try {
                const res = await fetch(`${BACKEND_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatInput: text, sessionId: getSessionId() })
                });
                const data = await res.json();
                typing.style.display = 'none';
                if (!res.ok) throw new Error(data.detail || 'API Error');
                addMessage(data.output, 'bot');
            } catch (e) {
                typing.style.display = 'none';
                addMessage("Извините, произошла ошибка. Попробуйте позже.", 'bot');
            }
        }

        function scrollToBottom() {
            messages.scrollTop = messages.scrollHeight;
        }

        function addMessage(text, type, scroll = true) {
            const div = document.createElement('div');
            div.className = `msg-container ${type}`;
            if (type === 'bot') {
                div.innerHTML = `<div class="msg-avatar"><img src="${AVATAR_URL}"></div><div class="msg-bubble bot">${text}</div>`;
            } else {
                div.innerHTML = `<div class="msg-bubble user">${text}</div>`;
            }
            messages.appendChild(div);
            
            if (scroll) {
                if (type === 'bot') {
                    // Small delay to ensure rendering is complete before scrolling
                    requestAnimationFrame(() => {
                        div.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                } else {
                    scrollToBottom();
                }
            }
        }

        // Init
        loadHistory().then(() => {
            const hasMessages = messages.querySelectorAll('.msg-container').length > 0;
            if (!hasMessages) {
                addMessage("Здравствуйте! Чем могу помочь?", 'bot');
            }
        });
    })();
});
