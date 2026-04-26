import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatbotIcon from "./ChatbotIcon.jsx"

const MD_COMPONENTS = {
  ul: ({ node, ...props }) => <ul className="my-list" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
}

const ChatMessage = ({ chat }) => {
  return (
    <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
      {chat.role === "model" && <ChatbotIcon />}
      <div className="message-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MD_COMPONENTS}
        >
          {chat.text || ''}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ChatMessage
