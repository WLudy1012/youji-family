import { Sparkles, Heart, Wand2, BookOpen, Shield } from 'lucide-react';

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsla(260,40%,6%,1)] via-[hsla(260,35%,8%,0.8)] to-transparent" />
      
      {/* 装饰线条 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[hsla(45,50%,50%,0.3)] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* 家族徽章 */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img
                src="/family_crest.png"
                alt="家族徽章"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="font-serif text-xl font-bold magic-text">魔法家族</h3>
                <p className="text-xs text-[hsl(45,40%,60%)]">世代传承的魔力</p>
              </div>
            </div>
            <p className="text-sm text-[hsl(45,40%,70%)] leading-relaxed">
              在星辰与魔法交织的夜空下，我们的家族故事跨越世代，如同霍格沃茨的传承，永不熄灭。
            </p>
          </div>

          {/* 快速链接 */}
          <div className="text-center">
            <h4 className="font-serif text-lg font-semibold text-[hsl(45,60%,80%)] mb-4 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              家族导航
            </h4>
            <ul className="space-y-2">
              {[
                { label: '家族首页', href: '#hero' },
                { label: '家族传承', href: '#family' },
                { label: '星图族谱', href: '#tree' },
                { label: '魔法聊天室', href: '#chat' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[hsl(45,40%,70%)] hover:text-[hsl(45,80%,60%)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 家族格言 */}
          <div className="text-center md:text-right">
            <h4 className="font-serif text-lg font-semibold text-[hsl(45,60%,80%)] mb-4 flex items-center justify-center md:justify-end gap-2">
              <Shield className="w-4 h-4" />
              家族格言
            </h4>
            <blockquote className="text-sm text-[hsl(45,40%,70%)] italic leading-relaxed mb-4">
              "在魔法的光芒下，家族的纽带永不断裂。"
            </blockquote>
            <div className="flex items-center justify-center md:justify-end gap-2 text-[hsl(45,60%,60%)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs tracking-wider">LUMOS MAXIMA</span>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="pt-8 border-t border-[hsla(45,50%,50%,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[hsl(45,40%,50%)]">
              © {currentYear} 魔法家族. 用
              <Heart className="inline w-3 h-3 mx-1 text-[hsl(45,60%,50%)]" />
              与魔法构建
            </p>
            <div className="flex items-center gap-4 text-[hsl(45,40%,50%)]">
              <Wand2 className="w-4 h-4" />
              <span className="text-xs tracking-wider">霍格沃茨风格家族网站</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
