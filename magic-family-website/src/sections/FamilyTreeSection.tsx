import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wand2, Star, Sparkles, Crown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  generation: number;
  x: number;
  y: number;
  isAncestor?: boolean;
}

const familyMembers: FamilyMember[] = [
  // 第一代（始祖）
  { id: 'ancestor', name: '始祖', relation: '家族创始人', generation: 1, x: 50, y: 15, isAncestor: true },
  
  // 第二代
  { id: 'g1-1', name: '长子', relation: '第二代', generation: 2, x: 30, y: 35 },
  { id: 'g1-2', name: '次女', relation: '第二代', generation: 2, x: 70, y: 35 },
  
  // 第三代
  { id: 'g2-1', name: '长孙', relation: '第三代', generation: 3, x: 20, y: 55 },
  { id: 'g2-2', name: '次孙女', relation: '第三代', generation: 3, x: 40, y: 55 },
  { id: 'g2-3', name: '三孙', relation: '第三代', generation: 3, x: 60, y: 55 },
  { id: 'g2-4', name: '四孙女', relation: '第三代', generation: 3, x: 80, y: 55 },
  
  // 第四代
  { id: 'g3-1', name: '曾孙', relation: '第四代', generation: 4, x: 15, y: 75 },
  { id: 'g3-2', name: '曾孙女', relation: '第四代', generation: 4, x: 30, y: 75 },
  { id: 'g3-3', name: '曾孙', relation: '第四代', generation: 4, x: 50, y: 75 },
  { id: 'g3-4', name: '曾孙女', relation: '第四代', generation: 4, x: 65, y: 75 },
  { id: 'g3-5', name: '曾孙', relation: '第四代', generation: 4, x: 80, y: 75 },
  
  // 第五代
  { id: 'g4-1', name: '玄孙', relation: '第五代', generation: 5, x: 25, y: 95 },
  { id: 'g4-2', name: '玄孙女', relation: '第五代', generation: 5, x: 45, y: 95 },
  { id: 'g4-3', name: '玄孙', relation: '第五代', generation: 5, x: 65, y: 95 },
];

// 连接关系
const connections = [
  // 第一代到第二代
  { from: 'ancestor', to: 'g1-1' },
  { from: 'ancestor', to: 'g1-2' },
  
  // 第二代到第三代
  { from: 'g1-1', to: 'g2-1' },
  { from: 'g1-1', to: 'g2-2' },
  { from: 'g1-2', to: 'g2-3' },
  { from: 'g1-2', to: 'g2-4' },
  
  // 第三代到第四代
  { from: 'g2-1', to: 'g3-1' },
  { from: 'g2-2', to: 'g3-2' },
  { from: 'g2-2', to: 'g3-3' },
  { from: 'g2-3', to: 'g3-4' },
  { from: 'g2-4', to: 'g3-5' },
  
  // 第四代到第五代
  { from: 'g3-2', to: 'g4-1' },
  { from: 'g3-3', to: 'g4-2' },
  { from: 'g3-4', to: 'g4-3' },
];

export function FamilyTreeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const animationRef = useRef<number>(0);

  // 绘制星座连线
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawConnections = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      connections.forEach(({ from, to }) => {
        const fromMember = familyMembers.find(m => m.id === from);
        const toMember = familyMembers.find(m => m.id === to);
        
        if (fromMember && toMember) {
          const fromX = (fromMember.x / 100) * rect.width;
          const fromY = (fromMember.y / 100) * rect.height;
          const toX = (toMember.x / 100) * rect.width;
          const toY = (toMember.y / 100) * rect.height;

          const isHighlighted = hoveredMember === from || hoveredMember === to;

          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          
          // 绘制曲线
          const midY = (fromY + toY) / 2;
          ctx.quadraticCurveTo(fromX, midY, toX, toY);
          
          ctx.strokeStyle = isHighlighted 
            ? 'rgba(255, 215, 120, 0.8)' 
            : 'rgba(255, 215, 120, 0.2)';
          ctx.lineWidth = isHighlighted ? 2 : 1;
          ctx.setLineDash(isHighlighted ? [] : [5, 5]);
          ctx.stroke();

          // 发光效果
          if (isHighlighted) {
            ctx.shadowColor = 'rgba(255, 215, 120, 0.8)';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      });

      ctx.setLineDash([]);
    };

    const animate = () => {
      drawConnections();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredMember]);

  // 滚动动画
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.star-node',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getMemberPosition = (member: FamilyMember) => ({
    left: `${member.x}%`,
    top: `${member.y}%`,
  });

  return (
    <section
      ref={sectionRef}
      id="tree"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* 背景星图 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsla(260,35%,8%,1)] via-[hsla(260,30%,15%,0.5)] to-[hsla(260,35%,8%,1)]" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* 标题区域 */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="w-6 h-6 text-[hsl(45,80%,60%)]" />
            <span className="text-sm tracking-[0.3em] uppercase text-[hsl(45,50%,70%)]">
              星图族谱
            </span>
            <Sparkles className="w-6 h-6 text-[hsl(45,80%,60%)]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold magic-text mb-6">
            血脉相连的星座
          </h2>
          <p className="text-lg text-[hsl(45,40%,70%)] max-w-2xl mx-auto leading-relaxed">
            将鼠标悬停在星图上，探索我们家族的魔法血脉。
            每一颗星星都代表着一个家族成员，连线指引着传承的方向。
          </p>
        </div>

        {/* 族谱星图 */}
        <div className="relative w-full aspect-[4/3] max-w-5xl mx-auto">
          {/* 代际标签 */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-around py-8 pointer-events-none hidden md:flex">
            {[5, 4, 3, 2, 1].map((gen) => (
              <div
                key={gen}
                className="flex items-center gap-3 text-[hsl(45,40%,60%)]"
              >
                <span className="text-xs tracking-wider">
                  {gen === 1 ? '始祖' : `第${gen}代`}
                </span>
                <div className="w-8 h-px bg-[hsla(45,50%,50%,0.3)]" />
              </div>
            ))}
          </div>

          {/* 家族成员节点 */}
          {familyMembers.map((member) => {
            const position = getMemberPosition(member);
            const isHovered = hoveredMember === member.id;
            const isConnected = hoveredMember && connections.some(
              c => (c.from === member.id || c.to === member.id) && (c.from === hoveredMember || c.to === hoveredMember)
            );
            const shouldDim = hoveredMember && !isHovered && !isConnected;

            return (
              <div
                key={member.id}
                className="star-node absolute -translate-x-1/2 -translate-y-1/2"
                style={position}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
                onClick={() => setSelectedMember(member)}
              >
                <div
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    shouldDim ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {/* 星星图标 */}
                  <div
                    className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-400 ${
                      member.isAncestor
                        ? 'bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(45,60%,40%)]'
                        : 'bg-gradient-to-br from-[hsla(260,40%,25%,0.8)] to-[hsla(260,40%,15%,0.8)] border-2 border-[hsla(45,60%,50%,0.5)]'
                    } ${isHovered ? 'scale-125 shadow-lg shadow-[hsla(45,80%,60%,0.4)]' : ''}`}
                  >
                    {member.isAncestor ? (
                      <Crown className="w-6 h-6 md:w-8 md:h-8 text-[hsl(260,30%,8%)]" />
                    ) : (
                      <Star className={`w-5 h-5 md:w-6 md:h-6 ${
                        isHovered ? 'text-[hsl(45,80%,60%)]' : 'text-[hsl(45,50%,70%)]'
                      } transition-colors duration-300`} />
                    )}
                    
                    {/* 发光效果 */}
                    {isHovered && (
                      <div className="absolute inset-0 rounded-full bg-[hsl(45,80%,60%)] animate-ping opacity-30" />
                    )}
                  </div>

                  {/* 名称标签 */}
                  <div
                    className={`mt-2 px-3 py-1 rounded-full bg-[hsla(260,30%,10%,0.9)] border border-[hsla(45,50%,50%,0.3)] transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-70'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-[hsl(45,70%,85%)]">
                      {member.name}
                    </span>
                  </div>

                  {/* 关系标签 */}
                  {isHovered && (
                    <div className="mt-1 px-2 py-0.5 rounded bg-[hsla(45,80%,60%,0.2)]">
                      <span className="text-xs text-[hsl(45,80%,70%)]">
                        {member.relation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 魔杖图标提示 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[hsl(45,50%,60%)] text-sm">
            <Wand2 className="w-4 h-4" />
            <span>点击星星查看详情</span>
          </div>
        </div>

        {/* 成员详情弹窗 */}
        {selectedMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[hsla(260,30%,8%,0.9)] backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="relative max-w-md w-full p-8 rounded-2xl border border-[hsla(45,50%,50%,0.3)] bg-gradient-to-br from-[hsla(260,25%,15%,0.95)] to-[hsla(260,25%,10%,0.95)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[hsla(45,50%,50%,0.2)] hover:bg-[hsla(45,80%,60%,0.3)] flex items-center justify-center transition-colors"
              >
                <span className="text-[hsl(45,70%,80%)]">×</span>
              </button>

              {/* 内容 */}
              <div className="text-center">
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    selectedMember.isAncestor
                      ? 'bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(45,60%,40%)]'
                      : 'bg-gradient-to-br from-[hsla(260,40%,30%,0.8)] to-[hsla(260,40%,20%,0.8)] border-2 border-[hsla(45,60%,50%,0.5)]'
                  }`}
                >
                  {selectedMember.isAncestor ? (
                    <Crown className="w-10 h-10 text-[hsl(260,30%,8%)]" />
                  ) : (
                    <Star className="w-8 h-8 text-[hsl(45,80%,60%)]" />
                  )}
                </div>

                <h3 className="font-serif text-2xl font-bold magic-text mb-2">
                  {selectedMember.name}
                </h3>

                <p className="text-[hsl(45,50%,70%)] mb-4">
                  {selectedMember.relation}
                </p>

                <div className="text-[hsl(45,40%,75%)] text-sm leading-relaxed">
                  {selectedMember.isAncestor ? (
                    <p>家族的创始人，开创了魔法血脉的传承。其智慧与勇气将永远指引着后代前行。</p>
                  ) : (
                    <p>家族的重要成员，为家族的繁荣与发展贡献了自己的力量。其故事将在家族中代代相传。</p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="mt-6 px-6 py-2 magic-btn rounded-full text-sm"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
