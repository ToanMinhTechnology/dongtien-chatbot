import { useEffect, useState, useRef } from "react";
import ChatbotIcon from "./components/ChatbotIcon.jsx";
import ChatForm from "./components/ChatForm.jsx";
import ChatMessage from "./components/ChatMessage.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";
import OrderForm from "./components/OrderForm.jsx";
import axios from "axios";
import { matchIntent, isOrderIntent } from "./utils/intentMatcher.js";
import { trackEvent } from "./utils/analytics.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {

    const updateHistory =(text, isOrder=false) =>{
      setChatHistory((prev) => [...prev.filter(msg=>msg.text !=="Thinking..."),{role:"model",text,isOrder}]);
    }

    // Get the latest user message
    const lastUserMessage = history[history.length - 1]?.text || "";
    if (import.meta.env.DEV) console.log("User message:", lastUserMessage);

    // Step 1: Order intent takes priority over FAQ — prevents "cách đặt bánh" FAQ
    // from intercepting explicit order requests like "muốn đặt bánh" or "order ngay"
    if (isOrderIntent(lastUserMessage)) {
      trackEvent('ORDER_INITIATED', { query: lastUserMessage });

      // Answer any embedded non-order question in the message first (spec step 1)
      // e.g. "muốn đặt bánh, cần trước mấy ngày?" → answer 1-2 ngày, then show form
      const embeddedMatch = matchIntent(lastUserMessage);
      const ORDER_FAQ_QUESTIONS = ['Muốn đặt bánh ngay', 'Cách đặt bánh tại Vani'];
      const hasEmbeddedAnswer =
        embeddedMatch.match && !ORDER_FAQ_QUESTIONS.includes(embeddedMatch.question);

      const ORDER_INTRO =
        '🎂 **Bạn muốn đặt bánh!**\n\nMình giúp bạn điền thông tin dưới đây để Vani chuẩn bị nhé! Đặt trước **1–2 ngày** để đảm bảo bánh đẹp.';

      const introText = hasEmbeddedAnswer
        ? `${embeddedMatch.answer}\n\n---\n\n${ORDER_INTRO}`
        : ORDER_INTRO;

      // Replace "Thinking..." with the intro message (spec step 2)
      updateHistory(introText);

      setPendingOrder({
        customerName: '',
        phone: '',
        product: '',
        quantity: 1,
        deliveryDate: '',
        deliveryAddress: '',
        notes: ''
      });
      return;
    }

    // Step 2: Check FAQ intent matching (before calling OpenAI)
    const intentResult = matchIntent(lastUserMessage);

    if (intentResult.match) {
      console.log("Intent matched:", intentResult.intent, "confidence:", intentResult.confidence);
      trackEvent('FAQ_ANSWERED', { intent: intentResult.intent, confidence: intentResult.confidence });
      updateHistory(intentResult.answer);
      return;
    }

    // Step 3: Fall back to OpenAI via server (API key stays server-side)
    trackEvent('OPENAI_FALLBACK', { query: lastUserMessage });
    try {
      const apiUrl = API_URL;
      const response = await axios.post(`${apiUrl}/api/chat`, { history });
      const botText = response.data.reply || "Xin lỗi, mình chưa hiểu câu hỏi. Bạn chat Zalo **0935 226 206** để được hỗ trợ nha!";
      updateHistory(botText);

    } catch (error) {
      console.error("Error generating bot response:", error);
      updateHistory("Xin lỗi, mình đang gặp chút vấn đề. Bạn chat Zalo **0935226206** để được hỗ trợ nha!");
    }
  };

  // Handle order confirmation
  const handleOrderConfirm = async (orderDetails) => {
    try {
      // Send to webhook
      const apiUrl = API_URL;
      const response = await axios.post(`${apiUrl}/api/order`, orderDetails);

      if (response.data.success) {
        trackEvent('ORDER_CONFIRMED', {
          orderId: response.data.orderId,
          product: orderDetails.product
        });

        setChatHistory((prev) => [...prev, {
          role: "model",
          text: `✅ **ĐẶT BÁNH THÀNH CÔNG!**\n\nMã đơn: ${response.data.orderId}\n\nVani sẽ gọi xác nhận trong 30 phút.\n\nCảm ơn bạn! 🎂`,
          isOrder: false
        }]);
        setPendingOrder(null);
      } else {
        setPendingOrder(null);
        setChatHistory((prev) => [...prev, {
          role: "model",
          text: "❌ **Có lỗi xảy ra!**\n\nVui lòng liên hệ Zalo **0935226206** để đặt bánh trực tiếp nha!"
        }]);
      }
    } catch (error) {
      console.error("Order confirm error:", error);
      setPendingOrder(null);
      setChatHistory((prev) => [...prev, {
        role: "model",
        text: "❌ **Có lỗi xảy ra!**\n\nVui lòng liên hệ Zalo **0935226206** để đặt bánh trực tiếp nha!"
      }]);
    }
  };

  // Handle Zalo redirect
  const handleChatZalo = () => {
    trackEvent('ZALO_REDIRECT', { source: 'chatbot' });
    window.open('https://zalo.me/0935226206', '_blank', 'noopener,noreferrer');
  };

  // Handle order cancellation
  const handleOrderCancel = () => {
    setPendingOrder(null);
    setChatHistory((prev) => [...prev, {
      role: "model",
      text: "Đã hủy đặt bánh. Bạn có thể hỏi mình về bánh khác hoặc liên hệ Zalo **0935 226 206** nha! 🎂"
    }]);
  };

  useEffect(() => {
    // Scroll to the bottom of the chat body when new messages are added
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatHistory]);

  return (
    <>
      {/* Centered welcome message */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        textAlign: 'center',
        fontSize: '2.4rem',
        color: '#6d4fc2',
        fontWeight: 700,
        letterSpacing: '0.5px',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        Chào mừng đến Tiệm Bánh Vani!<br/>
        Hỏi về bánh kem, đặt hàng ngay!
      </div>
      <div className={`container ${showChatbot ? 'show' : ''}`}>
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          id="chatbot-toggler"
          aria-label={showChatbot ? 'Đóng chatbot' : 'Mở chatbot'}
        >
          <span className="material-symbols-rounded">
            {showChatbot ? 'close' : 'mode_comment'}
          </span>
        </button>
        <div className={`chatbot-popup `}>
          {/* Chatbot Header */}
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h3>Tiệm Bánh Vani</h3>
              <p>Online</p>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="material-symbols-rounded"
              aria-label="Đóng chatbot"
            >
              close
            </button>
          </div>
          {/* Chatbot Body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              {/* Messages will appear here */}
              <ChatbotIcon></ChatbotIcon>
              <p className="message-text">
                Chào bạn! 🎂<br />
                Mình là chatbot của Tiệm Bánh Vani!<br />
                Hỏi mình về bánh kem, mousse, cách đặt hàng, giao hàng... nhé!
              </p>
            </div>

            {/* Chat History */}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}

            {/* Order Form (collect details) */}
            {pendingOrder && !pendingOrder.confirmDetails && (
              <div className="message bot-message">
                <ChatbotIcon />
                <div className="message-text" style={{ padding: '0' }}>
                  <OrderForm
                    onSubmit={(data) => {
                      setPendingOrder({ ...pendingOrder, ...data, confirmDetails: true });
                    }}
                    onCancel={handleOrderCancel}
                    onChatZalo={handleChatZalo}
                  />
                </div>
              </div>
            )}

            {/* Order Confirmation (review before submit) */}
            {pendingOrder && pendingOrder.confirmDetails && (
              <div className="message bot-message">
                <ChatbotIcon />
                <div className="message-text" style={{ padding: '0' }}>
                  <OrderConfirmation
                    orderDetails={pendingOrder}
                    onConfirm={() => handleOrderConfirm(pendingOrder)}
                    onCancel={handleOrderCancel}
                    onChatZalo={handleChatZalo}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Chatbot Footer */}
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
