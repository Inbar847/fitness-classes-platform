import { useEffect, useState } from 'react';

const AnimatedBackground = () => {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let mouseRaf = 0;
    let scrollRaf = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const nextX = event.clientX / window.innerWidth;
      const nextY = event.clientY / window.innerHeight;

      cancelAnimationFrame(mouseRaf);
      mouseRaf = window.requestAnimationFrame(() => {
        setMouse({ x: nextX, y: nextY });
      });
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;

      cancelAnimationFrame(scrollRaf);
      scrollRaf = window.requestAnimationFrame(() => {
        setScrollY(nextScrollY);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(mouseRaf);
      cancelAnimationFrame(scrollRaf);
    };
  }, []);

  const blobOneStyle = {
    transform: `translate3d(${(mouse.x - 0.5) * 40}px, ${scrollY * 0.015 + (mouse.y - 0.5) * 18}px, 0)`,
  };

  const blobTwoStyle = {
    transform: `translate3d(${(mouse.x - 0.5) * -32}px, ${scrollY * 0.012 + (mouse.y - 0.5) * -16}px, 0)`,
  };

  const blobThreeStyle = {
    transform: `translate3d(${(mouse.x - 0.5) * 24}px, ${scrollY * 0.01 + (mouse.y - 0.5) * 12}px, 0)`,
  };

  const pulseOneStyle = {
    left: `${18 + mouse.x * 18}%`,
    top: `${22 + ((scrollY * 0.03) % 18)}%`,
  };

  const pulseTwoStyle = {
    left: `${58 + mouse.x * 12}%`,
    top: `${30 + ((scrollY * 0.025) % 20)}%`,
  };

  const pulseThreeStyle = {
    left: `${30 + mouse.x * 22}%`,
    top: `${62 + ((scrollY * 0.02) % 14)}%`,
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f9fbff_0%,#eef4ff_52%,#f8fafc_100%)]" />

      <div className="absolute inset-0">
        <div
          className="absolute left-[-18%] top-[6%] h-[28rem] w-[145%] rounded-[50%] border-[18px] border-indigo-200/45 transition-transform duration-700 ease-out"
          style={blobOneStyle}
        />
        <div
          className="absolute left-[-12%] top-[14%] h-[32rem] w-[138%] rounded-[50%] border-[14px] border-sky-200/40 transition-transform duration-700 ease-out"
          style={blobTwoStyle}
        />
        <div
          className="absolute left-[-8%] top-[24%] h-[36rem] w-[132%] rounded-[50%] border-[10px] border-emerald-200/35 transition-transform duration-700 ease-out"
          style={blobThreeStyle}
        />
      </div>

      <div className="absolute inset-0">
        <div
          className="absolute left-[10%] top-[18%] h-5 w-28 rounded-full bg-white/70 blur-md"
          style={pulseOneStyle}
        />
        <div
          className="absolute left-[56%] top-[34%] h-5 w-24 rounded-full bg-sky-300/60 blur-md"
          style={pulseTwoStyle}
        />
        <div
          className="absolute left-[34%] top-[66%] h-4 w-20 rounded-full bg-emerald-300/55 blur-md"
          style={pulseThreeStyle}
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
};

export default AnimatedBackground;