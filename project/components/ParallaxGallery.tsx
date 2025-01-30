"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { MouseEvent, useRef, useState, useEffect } from "react";
import { Compass } from "lucide-react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1540206395-68808572332f?w=800&auto=format&fit=crop&q=60",
    depth: 1.2,
    category: "nature"
  },
  {
    src: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&auto=format&fit=crop&q=60",
    depth: 0.3,
    category: "abstract"
  },
  {
    src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&auto=format&fit=crop&q=60",
    depth: 0.8,
    category: "nature"
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60",
    depth: 1.5,
    category: "portrait"
  },
  {
    src: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&auto=format&fit=crop&q=60",
    depth: 0.2,
    category: "abstract"
  },
  {
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60",
    depth: 0.9,
    category: "nature"
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    depth: 0.5,
    category: "abstract"
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=60",
    depth: 1.3,
    category: "nature"
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60",
    depth: 0.6,
    category: "nature"
  },
  {
    src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&auto=format&fit=crop&q=60",
    depth: 1.1,
    category: "abstract"
  },
  {
    src: "https://images.unsplash.com/photo-1682687221248-3116ba6ab483?w=800&auto=format&fit=crop&q=60",
    depth: 0.4,
    category: "portrait"
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60",
    depth: 1.4,
    category: "nature"
  }
];

export default function ParallaxGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoAnimate, setAutoAnimate] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (autoAnimate) {
      timeoutId = setTimeout(() => setAutoAnimate(false), 3000);
    }
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (gyroEnabled && window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const x = event.gamma ? event.gamma / 45 : 0;
        const y = event.beta ? (event.beta - 45) / 45 : 0;
        mouseX.set(x);
        mouseY.set(y);
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [gyroEnabled, mouseX, mouseY]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY * 0.1);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current || gyroEnabled) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const x = (clientX - left - width / 2) / width;
    const y = (clientY - top - height / 2) / height;

    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic background effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-[#1a1a1a] via-[#0a0a0a] to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>
      
      <motion.button
        onClick={() => setGyroEnabled(!gyroEnabled)}
        className="absolute top-8 right-8 z-50 bg-white/10 backdrop-blur-lg p-3 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Compass className={`w-6 h-6 ${gyroEnabled ? 'text-blue-400' : 'text-white/70'}`} />
      </motion.button>

      <div
        ref={ref}
        className="relative w-full max-w-7xl aspect-[16/9] mx-auto p-20"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setActiveImage(null);
        }}
      >
        <AnimatePresence>
          {images.map(({ src, depth, category }, index) => {
            const springConfig = {
              damping: 15,
              stiffness: 150,
              mass: 1 + depth * 0.3
            };
            
            const x = useSpring(
              useTransform(
                mouseX,
                [-1, 1],
                [-200 * depth, 200 * depth]
              ),
              springConfig
            );
            
            const y = useSpring(
              useTransform(
                mouseY,
                [-1, 1],
                [-150 * depth, 150 * depth]
              ),
              springConfig
            );

            const scale = useSpring(
              isHovering ? 1 + depth * 0.4 : 1,
              springConfig
            );

            const rotateX = useSpring(
              useTransform(mouseY, [-1, 1], [12 * depth, -12 * depth]),
              springConfig
            );

            const rotateY = useSpring(
              useTransform(mouseX, [-1, 1], [-12 * depth, 12 * depth]),
              springConfig
            );

            const baseOpacity = 0.7 - depth * 0.1;
            const opacity = useSpring(
              activeImage === null
                ? isHovering ? 0.95 : baseOpacity
                : activeImage === index ? 1 : 0.3,
              springConfig
            );

            const blur = useSpring(
              isHovering ? 0 : (1 - depth) * 3,
              springConfig
            );

            // Orbital positioning
            const angle = (index / images.length) * Math.PI * 2;
            const radius = 30 + depth * 20;
            const orbitX = Math.cos(angle + scrollPosition * 0.1) * radius;
            const orbitY = Math.sin(angle + scrollPosition * 0.1) * radius;

            return (
              <motion.div
                key={src}
                className="absolute rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  width: `${15 + depth * 5}%`,
                  height: `${(15 + depth * 5) * 1.2}%`,
                  left: `${50 + orbitX - (15 + depth * 5) / 2}%`,
                  top: `${50 + orbitY - (15 + depth * 5) * 1.2 / 2}%`,
                  x,
                  y,
                  scale: activeImage === index ? scale.get() * 1.2 : scale,
                  rotateX,
                  rotateY,
                  opacity,
                  zIndex: Math.round(depth * 20),
                  transformStyle: "preserve-3d",
                  perspective: 1200,
                  filter: `blur(${blur}px)`,
                  boxShadow: `
                    0 ${20 * depth}px ${40 * depth}px rgba(0,0,0,${0.4 + depth * 0.2}),
                    0 ${2 * depth}px ${10 * depth}px rgba(0,0,0,${0.3 + depth * 0.1}),
                    inset 0 0 ${30 * depth}px rgba(0,0,0,${0.4 + depth * 0.1})
                  `,
                }}
                initial={autoAnimate ? { 
                  opacity: 0,
                  scale: 0.5,
                  y: 100
                } : false}
                animate={autoAnimate ? {
                  opacity: baseOpacity,
                  scale: 1,
                  y: 0
                } : {}}
                transition={{
                  duration: 1.2,
                  delay: index * 0.15,
                  ease: [0.23, 1, 0.32, 1]
                }}
                onClick={() => setActiveImage(activeImage === index ? null : index)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-full h-full relative group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"
                    style={{
                      opacity: 0.4,
                      transformStyle: "preserve-3d"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-black/40 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                    style={{ transformStyle: "preserve-3d" }}
                  />
                  <img
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <span className="bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                      {category}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.h1
          className="text-[12rem] font-bold text-white mb-8 italic tracking-tighter"
          style={{
            textShadow: "0 0 80px rgba(0,0,0,0.8)",
            WebkitTextStroke: "1px rgba(255,255,255,0.1)",
          }}
        >
          fancy.
        </motion.h1>
        <motion.button
          className="bg-white/90 backdrop-blur-md text-black px-16 py-5 rounded-full font-medium pointer-events-auto hover:bg-white transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          Download
        </motion.button>
      </motion.div>
    </div>
  );
}