import { useEffect, useState, useRef } from "react";
import ChatbotIcon from "./components/ChatbotIcon.jsx";
import ChatForm from "./components/ChatForm.jsx";
import ChatMessage from "./components/ChatMessage.jsx";
import OrderConfirmation from "./components/OrderConfirmation.jsx";
import OrderForm from "./components/OrderForm.jsx";
import axios from "axios";
import { matchIntent, isOrderIntent } from "./utils/intentMatcher.js";
import { trackEvent } from "./utils/analytics.js";

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
    console.log("User message:", lastUserMessage);

    // Step 1: Check intent matching FIRST (before calling Gemini)
    const intentResult = matchIntent(lastUserMessage);

    if (intentResult.match) {
      console.log("Intent matched:", intentResult.intent, "confidence:", intentResult.confidence);
      trackEvent('FAQ_ANSWERED', { intent: intentResult.intent });
      trackEvent('INTENT_MATCH', { intent: intentResult.intent, confidence: intentResult.confidence });
      updateHistory(intentResult.answer);
      return;
    }

    // Step 2: Check if order intent
    if (isOrderIntent(lastUserMessage)) {
      trackEvent('ORDER_INITIATED', { query: lastUserMessage });
      // Show order confirmation UI with empty form
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

    // Step 3: Fall back to OpenAI via server
    trackEvent('OPENAI_FALLBACK', { query: lastUserMessage });
    try {
      const response = await axios.post('http://localhost:3001/api/chat', { history });
      const botText = response.data.reply;
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
      const response = await axios.post('http://localhost:3001/api/order', orderDetails);

      if (response.data.success) {
        trackEvent('ORDER_CONFIRMED', {
          orderId: response.data.orderId,
          product: orderDetails.product
        });

        setChatHistory((prev) => [...prev, {
          role: "model",
          text: `✅ **ĐẶT BÁNH THÀNH CÔNG!**\n\nMã đơn: ${response.data.orderId}\n\nĐồng Tiền sẽ gọi xác nhận trong 30 phút.\n\nCảm ơn bạn! 🎂`,
          isOrder: false
        }]);
        setPendingOrder(null);
      }
    } catch (error) {
      console.error("Order confirm error:", error);
      setChatHistory((prev) => [...prev, {
        role: "model",
        text: "❌ **Có lỗi xảy ra!**\n\nVui lòng liên hệ Zalo **0935226206** để đặt bánh trực tiếp nha!"
      }]);
    }
  };

  // Handle Zalo redirect
  const handleChatZalo = () => {
    trackEvent('ZALO_REDIRECT', { source: 'chatbot' });
    window.open('https://zalo.me/0935226206', '_blank');
  };

  // Handle order cancellation
  const handleOrderCancel = () => {
    setPendingOrder(null);
    setChatHistory((prev) => [...prev, {
      role: "model",
      text: "Đã hủy đặt bánh. Bạn có thể hỏi mình về bánh khác hoặc liên hệ Zalo 0935226206 nha! 🎂"
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
        Chào mừng đến Đồng Tiền Bakery!<br/>
        Hỏi về bánh kem, đặt hàng ngay!
      </div>
      <div className={`container ${showChatbot ? 'show' : ''}`}>
        <button onClick={() => setShowChatbot(!showChatbot)} id="chatbot-toggler">
          <span className="material-symbols-rounded">
            {showChatbot ? 'close' : 'mode_comment'}
          </span>
        </button>
        <div className={`chatbot-popup `}>
          {/* Chatbot Header */}
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h3>Đồng Tiền Bakery</h3>
              <p>Online</p>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="material-symbols-rounded"
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
                Mình là chatbot của Đồng Tiền Bakery!<br />
                Hỏi mình về giá bánh, cách đặt hàng, giao hàng... nhé!
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
