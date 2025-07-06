'use client';

import React, { useEffect, useState } from 'react';

interface ProgressItemProps {
  icon: string;
  text: string;
  status: 'completed' | 'in-progress';
}

const ProgressItem: React.FC<ProgressItemProps> = ({ icon, text, status }) => {
  const statusColor = status === 'completed' ? 'text-green-500' : 'text-amber-500';
  
  return (
    <div className="flex items-center mb-3 p-3 bg-gray-800 bg-opacity-60 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:bg-opacity-70 hover:translate-x-1">
      <span className={`mr-3 text-lg w-6 text-center ${statusColor}`}>
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
};

interface InfoCardProps {
  type: 'warning' | 'release';
  icon: string;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ type, icon, title, children }) => {
  const borderColor = type === 'warning' ? 'border-l-amber-500' : 'border-l-purple-500';
  const bgGradient = type === 'warning' 
    ? 'bg-gradient-to-r from-amber-500/20 to-transparent' 
    : 'bg-gradient-to-r from-purple-500/20 to-transparent';
  const headerColor = type === 'warning' ? 'text-amber-400' : 'text-purple-300';

  return (
    <div className={`${bgGradient} rounded-xl p-6 border-l-4 ${borderColor} transition-all duration-300 hover:translate-x-1 bg-black/50`}>
      <div className={`flex items-center gap-3 text-lg font-semibold mb-2 ${headerColor}`}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-slate-300 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

const MaintenanceContainer: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [subtitleEnVisible, setSubtitleEnVisible] = useState(false);

  useEffect(() => {
    // ページロード時のアニメーション制御
    const timer1 = setTimeout(() => setIsLoaded(true), 100);
    const timer2 = setTimeout(() => setTitleVisible(true), 300);
    const timer3 = setTimeout(() => setSubtitleVisible(true), 500);
    const timer4 = setTimeout(() => setSubtitleEnVisible(true), 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleTitleClick = () => {
    // タイトルクリック時の効果
    const titleElement = document.querySelector('.main-title');
    if (titleElement) {
      titleElement.classList.add('scale-105');
      setTimeout(() => {
        titleElement.classList.remove('scale-105');
      }, 200);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white bg-gradient-to-b from-black via-gray-900 to-black">
      {/* 背景パターン */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.01) 10px,
              rgba(255, 255, 255, 0.01) 20px
            )
          `
        }}
      />

      {/* メインコンテナ */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-5 text-center">
        
        {/* ヘッダーセクション */}
        <div className={`py-8 mb-8 max-w-3xl relative transition-all duration-1200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* メインタイトル */}
          <h1 
            className={`relative px-0 py-4 flex flex-col items-center gap-1 cursor-pointer transition-all duration-1000 mb-2 main-title ${titleVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleTitleClick}
            style={{
              fontSize: '3.2rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#e0e0e0',
              background: 'linear-gradient(110deg, #e0e0e0 45%, #ffffff 55%, #e0e0e0 65%)',
              backgroundSize: '200% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shinyText 3s ease-in-out infinite',
            }}
          >
            {/* 上のライン */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5"
              style={{
                width: '80%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.4), transparent)'
              }}
            />
            
            <span className="block leading-tight">Mythologia</span>
            <span className="block leading-tight">Admiral Ship Bridge</span>
            
            {/* 下のライン */}
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5"
              style={{
                width: '80%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.4), transparent)'
              }}
            />
          </h1>

          {/* サブタイトル */}
          <p className={`text-xl text-slate-300 mb-2 font-light tracking-wide transition-all duration-1000 ${subtitleVisible ? 'opacity-100' : 'opacity-0'}`}>
            神託のメソロギア ファンサイト
          </p>
          
          {/* 英語サブタイトル */}
          <p className={`text-base text-slate-400 italic tracking-widest transition-all duration-1000 ${subtitleEnVisible ? 'opacity-100' : 'opacity-0'}`}>
            Mythologia the Oracle Fan Site
          </p>
        </div>

        {/* Coming Soon セクション */}
        <div className="py-10 my-6 max-w-2xl">
          <div className="text-4xl mb-12 text-yellow-400 font-semibold">
            ⚔️ Coming Soon ⚔️
          </div>
          
          <div className="text-lg leading-relaxed text-slate-300 mb-12">
            メソロギアの世界をさらに深く楽しめる環境にするため<br />
            ファンの皆様により充実した体験をお届けできるよう開発中です。
          </div>

          {/* プログレスセクション */}
          <div className="bg-black bg-opacity-20 rounded-xl p-6 border border-yellow-500 border-opacity-20">
            <div className="text-xl mb-4 text-yellow-400 flex items-center gap-2 font-semibold">
              📋 開発状況
            </div>
            
            <ProgressItem 
              icon="✅" 
              text="システム設計完了済み" 
              status="completed" 
            />
            <ProgressItem 
              icon="🔄" 
              text="実装準備中" 
              status="in-progress" 
            />
            <ProgressItem 
              icon="🔄" 
              text="公式デザイン準拠調整中" 
              status="in-progress" 
            />
          </div>
        </div>

        {/* 情報セクション */}
        <div className="grid grid-cols-1 gap-12 my-8 max-w-2xl w-full">
          <InfoCard type="warning" icon="⚠️" title="重要なお知らせ">
            こちらは非公式ファンサイトです。<br />
            公式運営・株式会社ネコノメとは一切関係ありません。
          </InfoCard>

          <InfoCard type="release" icon="🚀" title="リリース予定">
            <strong>2025年夏頃</strong>を予定しています
          </InfoCard>
        </div>

        {/* フッターリンク */}
        <div className="mt-12 flex gap-8 flex-wrap justify-center">
          <a 
            href="https://mythologiatheoracle.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 no-underline py-2 px-4 border border-white border-opacity-20 rounded-md transition-all duration-300 text-sm hover:text-yellow-400 hover:border-yellow-400 hover:bg-opacity-5"
          >
            公式サイト
          </a>
          <a 
            href="https://x.com/mythologia_jp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 no-underline py-2 px-4 border border-white border-opacity-20 rounded-md transition-all duration-300 text-sm hover:text-yellow-400 hover:border-yellow-400 hover:bg-opacity-5"
          >
            公式X
          </a>
          <a 
            href="https://discord.gg/GFaEAxjJES" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 no-underline py-2 px-4 border border-white border-opacity-20 rounded-md transition-all duration-300 text-sm hover:text-yellow-400 hover:border-yellow-400 hover:bg-opacity-5"
          >
            公式Discordサーバー
          </a>
        </div>
      </div>

      {/* CSS アニメーション */}
      <style jsx>{`
        @keyframes shinyText {
          0% {
            background-position: -200% 0;
          }
          50% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceContainer;