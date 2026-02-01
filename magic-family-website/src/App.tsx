import { useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StardustBackground } from './components/StardustBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './sections/HeroSection';
import { FamilySection } from './sections/FamilySection';
import { FamilyTreeSection } from './sections/FamilyTreeSection';
import { ChatSection } from './sections/ChatSection';
import { FooterSection } from './sections/FooterSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  // 平滑滚动导航
  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // 导航栏高度偏移
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // 初始化平滑滚动
  useEffect(() => {
    // 检测用户是否偏好减少动画
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      // 刷新 ScrollTrigger 以确保正确计算
      ScrollTrigger.refresh();
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* 星屑背景 */}
      <StardustBackground />
      
      {/* 导航栏 */}
      <Navbar onNavigate={handleNavigate} />
      
      {/* 主内容区域 */}
      <main className="relative z-10">
        {/* 英雄区 */}
        <HeroSection onNavigate={handleNavigate} />
        
        {/* 家族简介 */}
        <FamilySection />
        
        {/* 族谱星图 */}
        <FamilyTreeSection />
        
        {/* 聊天区 */}
        <ChatSection />
        
        {/* 页脚 */}
        <FooterSection />
      </main>
    </div>
  );
}

export default App;
