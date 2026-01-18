import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Wand2, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题动画
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { 
            clipPath: 'inset(0 100% 0 0)',
            opacity: 0 
          },
          { 
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1.5,
            ease: 'expo.out',
            delay: 0.5
          }
        );
      }

      // 副标题动画
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 1.2 }
        );
      }

      // 装饰元素动画
      if (decorRef.current) {
        gsap.fromTo(
          decorRef.current.children,
          { scale: 0, rotation: -180 },
          { 
            scale: 1, 
            rotation: 0, 
            duration: 1.2, 
            stagger: 0.2, 
            ease: 'back.out(1.7)', 
            delay: 1.5 
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 滚动视差效果
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !titleRef.current) return;
      
      const scrollY = window.scrollY;
      const sectionHeight = sectionRef.current.offsetHeight;
      
      if (scrollY < sectionHeight) {
        const progress = scrollY / sectionHeight;
        gsap.set(titleRef.current, {
          y: -scrollY * 0.5,
          opacity: 1 - progress * 1.5
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsla(260,35%,8%,0.9)] via-[hsla(260,30%,12%,0.8)] to-[hsla(260,35%,8%,1)]" />
      
      {/* 魔法粒子效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[hsl(45,80%,70%)] rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: '0 0 10px hsl(45,80%,70%)',
            }}
          />
        ))}
      </div>

      {/* 装饰圆环 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full border border-[hsla(45,50%,50%,0.1)] animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-[hsla(45,50%,50%,0.08)] animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <div className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-[hsla(45,50%,50%,0.05)] animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* 徽章 */}
        <div ref={decorRef} className="flex justify-center gap-4 mb-8">
          <Wand2 className="w-8 h-8 text-[hsl(45,80%,60%)] opacity-60" />
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-[hsl(45,80%,60%)] to-transparent" />
          <Sparkles className="w-8 h-8 text-[hsl(45,80%,60%)] opacity-60" />
        </div>

        {/* 主标题 */}
        <h1
          ref={titleRef}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
        >
          <span className="magic-text block">魔法家族</span>
          <span className="text-[hsl(45,50%,80%)] text-2xl md:text-3xl lg:text-4xl font-normal mt-1 block">
            世代传承的魔力
          </span>
        </h1>

        {/* 副标题 */}
        <p
          ref={subtitleRef}
          className="text-base md:text-lg text-[hsl(45,40%,70%)] max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          在星辰与魔法交织的夜空下，我们的家族故事跨越世代，
          <br className="hidden md:block" />
          如同霍格沃茨的传承，永不熄灭。
        </p>

        {/* 徽章图片 */}
        <div className="relative inline-block mb-12 group">
          <div className="absolute inset-0 bg-[hsl(45,80%,60%)] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          <img
            src="/family_crest.png"
            alt="家族徽章"
            className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
          />
        </div>

        {/* 滚动提示 */}
        <button
          onClick={() => onNavigate('family')}
          className="flex flex-col items-center gap-2 mx-auto text-[hsl(45,50%,60%)] hover:text-[hsl(45,80%,70%)] transition-colors group"
        >
          <span className="text-sm tracking-widest uppercase">探索家族历史</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(260,35%,8%)] to-transparent" />
    </section>
  );
}