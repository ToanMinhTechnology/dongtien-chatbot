import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatbotIcon from "./ChatbotIcon.jsx"

const MD_COMPONENTS = {
  ul: ({ node, ...props }) => <ul className="my-list" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
  img: ({ node, src, alt }) => {
    if (!src || !src.startsWith('https://product.hstatic.net/')) return null;
    return (
      <img
        src={src}
        alt={alt || 'Ảnh bánh'}
        style={{ maxWidth: '100%', borderRadius: '10px', marginBottom: '8px', display: 'block' }}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  },
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
