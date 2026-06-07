import React from 'react';

export default function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#000000]">
      {/* 80% visual prominence in absolute deep dark: Subtle high-tech sports pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #EDEDED 1px, transparent 0),
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px, 128px 128px, 128px 128px'
        }}
      />

      {/* AMBIENT SPORTS LIGHTING / EVENT LIGHTS (ESPN / ESports broadcast vibe) */}
      {/* Glow Left: Electric Blue #3D56F5 */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full filter blur-[140px] bg-[#3D56F5]/10 animate-pulse" style={{ animationDuration: '6s' }} />
      
      {/* Glow Right: High Power Red #E10000 */}
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full filter blur-[160px] bg-[#E10000]/10 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Center Subtle Glow: Emerald/Lime Green #08C84C */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] rounded-full filter blur-[150px] bg-[#08C84C]/5" />

      {/* SLEEK TECHNICAL BARS & COLORED LIGHT BLOCKS (Riot / F1 / DAZN style) */}
      {/* Top Border Light Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E10000] via-[#3D56F5] to-[#08C84C] opacity-40" />

      {/* Sports HUD Corner Angles & Grid Dots */}
      <div className="absolute inset-x-8 inset-y-12 border border-white/[0.02] rounded-3xl hidden md:block">
        {/* Top-left corner mark */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/10" />
        {/* Top-right corner mark */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E10000]/25" />
        {/* Bottom-left corner mark */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#08C84C]/25" />
        {/* Bottom-right corner mark */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#3D56F5]/25" />
      </div>

      {/* Subtle Vertical Broadcast Side panels */}
      <div className="absolute left-0 top-[20%] bottom-[20%] w-[1px] bg-gradient-to-b from-transparent via-[#3D56F5]/20 to-transparent" />
      <div className="absolute right-0 top-[20%] bottom-[20%] w-[1px] bg-gradient-to-b from-transparent via-[#E10000]/20 to-transparent" />

      {/* Suttle dark noise grain wrapper for depth */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
