import { useEffect, useState, useRef } from 'react';
import { Menu, X, Send, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

interface NavbarProps {
  onNavigate: (section: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { id: 'hero', label: '家族' },
    { id: 'family', label: '传承' },
    { id: 'tree', label: '族谱' },
    { id: 'chat', label: '聊天' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.2 }
      );
    }

    if (linksRef.current) {
      gsap.fromTo(
        linksRef.current.children,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.8 }
      );
    }
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'w-auto px-6 py-3 backdrop-blur-xl bg-[hsla(260,30%,12%,0.85)] border border-[hsla(45,50%,50%,0.2)] rounded-full shadow-2xl shadow-[hsla(45,80%,60%,0.15)]'
          : 'w-full max-w-6xl px-6 py-4 bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-8">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <img
            src="/family_crest.png"
            alt="家族徽章"
            className={`transition-all duration-500 ${
              isScrolled ? 'w-8 h-8' : 'w-10 h-10'
            } group-hover:scale-110 group-hover:rotate-12`}
          />
          <span className={`font-serif font-bold tracking-wider magic-text transition-all duration-300 ${
            isScrolled ? 'text-lg' : 'text-xl'
          }`}>
            魔法家族
          </span>
        </button>

        {/* Desktop Links */}
        <div ref={linksRef} className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="relative text-sm font-medium text-[hsl(45,50%,80%)] hover:text-[hsl(45,80%,60%)] transition-all duration-300 group py-2"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(45,90%,80%)] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => handleNavClick('chat')}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 magic-btn rounded-full text-sm"
        >
          <Send className="w-4 h-4" />
          <span>发送消息</span>
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[hsl(45,80%,70%)] hover:text-[hsl(45,90%,90%)] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 mt-2 p-4 backdrop-blur-xl bg-[hsla(260,30%,12%,0.95)] border border-[hsla(45,50%,50%,0.2)] rounded-2xl transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="flex items-center gap-3 px-4 py-3 text-[hsl(45,50%,80%)] hover:text-[hsl(45,80%,60%)] hover:bg-[hsla(45,50%,50%,0.1)] rounded-lg transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          ))}
          <button
            onClick={() => handleNavClick('chat')}
            className="flex items-center justify-center gap-2 px-4 py-3 mt-2 magic-btn rounded-lg"
          >
            <Send className="w-4 h-4" />
            <span>发送消息</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
