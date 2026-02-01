import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TreeDeciduous, Users, Heart, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const familyCards = [
  {
    id: 'heritage',
    title: '传承',
    icon: TreeDeciduous,
    description: '我们家族的历史根植于传统和坚韧。每一代人都将智慧与力量传递给下一代，如同古老的魔法在血脉中流淌。',
    color: 'from-amber-600/20 to-amber-800/20',
  },
  {
    id: 'growth',
    title: '成长',
    icon: Users,
    description: '每一代人都在前人的基础上不断进化。我们拥抱变化，在时代的洪流中保持着家族的荣耀与初心。',
    color: 'from-purple-600/20 to-purple-800/20',
  },
  {
    id: 'bond',
    title: '纽带',
    icon: Heart,
    description: '将我们联系在一起的是爱、支持和共同回忆的纽带。无论身在何处，家族的精神永远指引着我们前行。',
    color: 'from-rose-600/20 to-rose-800/20',
  },
];

export function FamilySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题动画
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 卡片动画
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 100, rotateY: -15 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="family"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsla(45,80%,60%,0.03)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsla(260,50%,50%,0.03)] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        {/* 标题区域 */}
        <div ref={titleRef} className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Shield className="w-6 h-6 text-[hsl(45,80%,60%)]" />
            <span className="text-sm tracking-[0.3em] uppercase text-[hsl(45,50%,70%)]">
              家族精神
            </span>
            <Shield className="w-6 h-6 text-[hsl(45,80%,60%)]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold magic-text mb-6">
            世代传承的力量
          </h2>
          <p className="text-lg text-[hsl(45,40%,70%)] max-w-2xl mx-auto leading-relaxed">
            在时光的长河中，我们的家族如同一颗璀璨的星辰，
            闪耀着智慧、勇气与爱的光芒。
          </p>
        </div>

        {/* 卡片网格 */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 perspective-1000"
        >
          {familyCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative preserve-3d"
              style={{
                transform: `rotateY(${index === 0 ? -2 : index === 2 ? 2 : 0}deg)`,
              }}
            >
              <div className="relative h-full p-8 rounded-2xl border border-[hsla(45,50%,50%,0.2)] bg-gradient-to-br from-[hsla(260,25%,15%,0.8)] to-[hsla(260,25%,12%,0.8)] backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-[hsla(45,80%,60%,0.4)] group-hover:shadow-xl group-hover:shadow-[hsla(45,80%,60%,0.1)]">
                {/* 悬停光泽效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 0.8s ease, opacity 0.5s ease' }} />
                
                {/* 背景渐变 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-50`} />
                
                {/* 内容 */}
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[hsla(45,80%,60%,0.2)] to-[hsla(45,60%,40%,0.2)] flex items-center justify-center border border-[hsla(45,80%,60%,0.3)] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <card.icon className="w-8 h-8 text-[hsl(45,80%,60%)]" />
                  </div>
                  
                  <h3 className="font-serif text-2xl font-bold text-center mb-4 magic-text">
                    {card.title}
                  </h3>
                  
                  <p className="text-center text-[hsl(45,40%,75%)] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(45,80%,60%)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* 连接装饰线 */}
        <svg
          className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(45,80%,60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(45,80%,60%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(45,80%,60%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 200 300 Q 400 200 600 300 T 1000 300"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </svg>
      </div>
    </section>
  );
}
