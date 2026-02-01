import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Github, LogOut, MessageCircle, BookOpen, Feather } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isOwn?: boolean;
}

// 模拟初始消息
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    user: '家族长老',
    avatar: '🧙‍♂️',
    content: '欢迎来到家族的魔法聊天室！在这里，我们可以分享家族的故事和传承。',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    user: '星辰守护者',
    avatar: '✨',
    content: '族谱星图已经点亮，欢迎新成员加入我们的魔法家族！',
    timestamp: new Date(Date.now() - 1800000),
  },
];

// 模拟 GitHub 用户头像
const wizardAvatars = [
  { emoji: '🧙‍♂️', name: '老巫师' },
  { emoji: '🧙‍♀️', name: '女巫师' },
  { emoji: '✨', name: '星辰使者' },
  { emoji: '🌙', name: '月影行者' },
  { emoji: '🔮', name: '水晶预言家' },
  { emoji: '📜', name: '卷轴守护者' },
  { emoji: '🦉', name: '猫头鹰信使' },
  { emoji: '⚡', name: '雷电法师' },
];

export function ChatSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 滚动动画
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.chat-container',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 自动滚动到新消息
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 模拟 GitHub 登录
  const handleGitHubLogin = () => {
    setIsLoading(true);
    
    // 模拟登录延迟
    setTimeout(() => {
      const randomAvatar = wizardAvatars[Math.floor(Math.random() * wizardAvatars.length)];
      setCurrentUser({ name: randomAvatar.name, avatar: randomAvatar.emoji });
      setIsLoggedIn(true);
      setIsLoading(false);
      
      // 发送欢迎消息
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        user: '系统',
        avatar: '🎉',
        content: `${randomAvatar.name} 加入了聊天室！欢迎来到魔法家族的聚集地。`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }, 1500);
  };

  const handleLogout = () => {
    if (currentUser) {
      const leaveMessage: ChatMessage = {
        id: Date.now().toString(),
        user: '系统',
        avatar: '👋',
        content: `${currentUser.name} 离开了聊天室。期待下次再见！`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, leaveMessage]);
    }
    
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !currentUser || !isLoggedIn) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: currentUser.name,
      avatar: currentUser.avatar,
      content: inputValue,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <section
      ref={sectionRef}
      id="chat"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* 背景 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsla(260,35%,8%,1)] via-[hsla(260,25%,15%,0.8)] to-[hsla(260,35%,8%,1)]" />
        {/* 羊皮纸纹理 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              hsla(45, 30%, 50%, 0.1) 2px,
              hsla(45, 30%, 50%, 0.1) 4px
            )`,
          }} />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Feather className="w-6 h-6 text-[hsl(45,80%,60%)]" />
            <span className="text-sm tracking-[0.3em] uppercase text-[hsl(45,50%,70%)]">
              魔法聊天室
            </span>
            <MessageCircle className="w-6 h-6 text-[hsl(45,80%,60%)]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold magic-text mb-4">
            家族密语
          </h2>
          <p className="text-[hsl(45,40%,70%)]">
            在这里，家族成员可以分享故事、交流感情
          </p>
        </div>

        {/* 聊天容器 */}
        <div className="chat-container relative">
          {/* 登录状态栏 */}
          <div className="flex items-center justify-between p-4 border-b border-[hsla(45,50%,50%,0.2)] bg-[hsla(260,25%,12%,0.8)] backdrop-blur-sm rounded-t-xl">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[hsl(45,80%,60%)]" />
              <span className="text-[hsl(45,60%,80%)] font-medium">
                {isLoggedIn ? `${currentUser?.avatar} ${currentUser?.name}` : '访客模式'}
              </span>
            </div>
            
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[hsl(45,50%,70%)] hover:text-[hsl(45,80%,80%)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            ) : (
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 magic-btn rounded-lg text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[hsl(260,30%,8%)] border-t-transparent rounded-full animate-spin" />
                    <span>登录中...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span>使用 GitHub 登录</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 消息列表 */}
          <div className="relative h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4 bg-[hsla(260,25%,10%,0.5)] backdrop-blur-sm border-x border-[hsla(45,50%,50%,0.1)]">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                  message.isOwn ? 'flex-row-reverse' : ''
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  message.isOwn
                    ? 'bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(45,60%,40%)]'
                    : 'bg-[hsla(260,30%,20%,0.8)] border border-[hsla(45,50%,50%,0.3)]'
                }`}>
                  {message.avatar}
                </div>

                {/* 消息内容 */}
                <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isOwn
                      ? 'bg-gradient-to-br from-[hsl(45,80%,50%)] to-[hsl(45,70%,40%)] text-[hsl(260,30%,8%)]'
                      : 'bg-[hsla(260,30%,18%,0.8)] border border-[hsla(45,50%,50%,0.2)] text-[hsl(45,70%,90%)]'
                  }`}>
                    {!message.isOwn && message.user !== '系统' && (
                      <span className="block text-xs font-medium mb-1 opacity-70">
                        {message.user}
                      </span>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <span className="mt-1 text-xs text-[hsl(45,40%,50%)]">
                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 p-4 border-t border-[hsla(45,50%,50%,0.2)] bg-[hsla(260,25%,12%,0.8)] backdrop-blur-sm rounded-b-xl"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isLoggedIn ? '输入你的魔法密语...' : '请先登录以发送消息'}
              disabled={!isLoggedIn || isLoading}
              className="flex-1 px-4 py-3 bg-[hsla(260,30%,18%,0.5)] border border-[hsla(45,50%,50%,0.2)] rounded-full text-[hsl(45,70%,90%)] placeholder:text-[hsl(45,40%,50%)] focus:outline-none focus:border-[hsla(45,80%,60%,0.5)] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isLoggedIn || !inputValue.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-full magic-btn flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* 提示信息 */}
        {!isLoggedIn && (
          <div className="mt-6 text-center text-sm text-[hsl(45,40%,60%)]">
            <p>使用 GitHub 账号登录，即可获得专属巫师头像参与家族对话</p>
          </div>
        )}
      </div>
    </section>
  );
}