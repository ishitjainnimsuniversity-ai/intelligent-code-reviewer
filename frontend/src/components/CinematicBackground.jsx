import React from 'react';

export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* User Downloaded Animated GIF Background */}
      <div 
        className="absolute inset-0 opacity-25 mix-blend-screen scale-105"
        style={{
          backgroundImage: 'url("/bg-cinematic.gif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7) contrast(1.2)'
        }}
      />

      {/* Cybernetic Dark Gradient Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.07) 0%, rgba(6, 182, 212, 0.05) 40%, #03060f 85%)'
        }}
      />

      {/* Subtle Scan Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
    </div>
  );
}
