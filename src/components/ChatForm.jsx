import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = ""; 

    // Add user message and "Thinking..." together so generateBotResponse always
    // sees a "Thinking..." to replace — avoids the race where an instant FAQ match
    // fires updateHistory() before the old 600ms setTimeout could add it.
    const newHistory = [...chatHistory, { role: "user", text: userMessage }];
    setChatHistory([...newHistory, { role: "model", text: "Thinking..." }]);

    generateBotResponse(newHistory);
  };

  return (
    <form action="#" onSubmit={handleFormSubmit} className="chat-form">
      <input
        type="text"
        className="message-input"
        placeholder="Type your message..."
        ref={inputRef}
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
