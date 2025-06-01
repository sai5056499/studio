
"use client";
import Link from "next/link";
import { AppLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ListChecks, 
  History, 
  PenSquare, 
  Languages, 
  ScanText, 
  FileQuestion,
  Zap,
  BarChart3,
  ChevronRight,
  MoveRight
} from "lucide-react";
import * as React from "react";

// Define feature items based on existing app structure
const featureItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & AI Chat." },
  { href: "/writer", label: "AI Writer", icon: PenSquare, description: "Generate diverse content." },
  { href: "/translate", label: "Translator", icon: Languages, description: "Translate text instantly." },
  { href: "/ocr", label: "OCR", icon: ScanText, description: "Extract text from images." },
  { href: "/chat-pdf", label: "Chat PDF", icon: FileQuestion, description: "Converse with your documents." },
  { href: "/planning", label: "Task Planner", icon: ListChecks, description: "AI-powered task breakdown." },
  { href: "/habits", label: "Habit Tracker", icon: Zap, description: "Build and maintain habits." },
  { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Visualize your progress." },
  { href: "/history", label: "Chat History", icon: History, description: "Review past conversations." },
];

const Sphere = ({ size, color, top, left, right, bottom, animationDelay }: { size: string; color: string; top?: string; left?: string; right?: string; bottom?: string; animationDelay?: string }) => (
  <div
    className="absolute rounded-full opacity-50 animate-pulse" // Base opacity adjusted
    style={{
      width: size,
      height: size,
      background: color,
      top,
      left,
      right,
      bottom,
      animationDuration: '7s', // Slightly longer duration
      animationDelay: animationDelay || '0s',
      filter: 'blur(5px)' // Slightly more blur
    }}
    data-ai-hint="sphere decoration"
  ></div>
);

const GlassShape = ({ className, children, dataAiHint }: { className?: string, children?: React.ReactNode, dataAiHint?: string }) => (
  <div
    className={`absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl ${className}`}
    data-ai-hint={dataAiHint || "geometric shape abstract"}
  >
    {children}
  </div>
);


export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 text-white landing-page-bg">
      {/* Background Shapes & Spheres - Decorative */}
      <Sphere size="180px" color="radial-gradient(circle, hsla(275, 70%, 55%, 0.6) 0%, hsla(250, 70%, 40%, 0.1) 100%)" top="5%" left="2%" animationDelay="0s" />
      <Sphere size="100px" color="radial-gradient(circle, hsla(180, 70%, 60%, 0.5) 0%, hsla(220, 70%, 45%, 0.1) 100%)" top="55%" left="12%" animationDelay="1.2s" />
      <Sphere size="150px" color="radial-gradient(circle, hsla(310, 65%, 60%, 0.4) 0%, hsla(280, 60%, 40%, 0.1) 100%)" top="15%" right="8%" animationDelay="0.6s" />
      <Sphere size="70px" color="radial-gradient(circle, hsla(230, 75%, 65%, 0.6) 0%, hsla(300, 60%, 30%, 0.1) 100%)" bottom="10%" right="15%" animationDelay="1.8s" />
      <Sphere size="220px" color="radial-gradient(circle, hsla(260, 60%, 50%, 0.3) 0%, hsla(240, 50%, 30%, 0.05) 100%)" bottom="2%" left="20%" animationDelay="0.3s" />
      
      <GlassShape className="w-[400px] h-[300px] -rotate-[15deg] top-[15%] left-[calc(50%-350px)] opacity-50" dataAiHint="crystal shard" />
      <GlassShape className="w-[350px] h-[250px] rotate-[20deg] bottom-[20%] right-[calc(50%-300px)] opacity-40" dataAiHint="glass panel" />


      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold">Content Ally</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="#features" className="text-sm hover:underline hidden md:block">
            Features
          </Link>
          <Button asChild variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white backdrop-blur-sm">
            <Link href="/dashboard">Launch App</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-5 flex flex-col items-center justify-center text-center flex-grow pt-20 pb-10">
        <GlassShape className="px-8 py-10 md:px-12 md:py-16 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Intelligent <span className="text-purple-300">Content</span>,
            <br className="hidden md:block" /> Effortless <span className="text-blue-300">Planning</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 md:mb-10 max-w-xl mx-auto">
            Aura is your AI-powered suite for seamless content creation, task management, and productivity enhancement.
            Unlock your potential.
          </p>
          <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg px-8 py-6 shadow-xl">
            <Link href="/dashboard">
              Get Started <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </GlassShape>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-5 w-full max-w-6xl py-10 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12">Explore Content Ally Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href} legacyBehavior>
                <a className="block p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-500/30 hover:-translate-y-1 group">
                  <div className="flex items-center mb-3">
                    <Icon className="h-7 w-7 text-purple-300 mr-4" />
                    <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{item.description}</p>
                  <div className="text-xs text-blue-300 group-hover:underline flex items-center">
                    Go to {item.label} <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </section>
      <style jsx global>{`
        .landing-page-bg {
          background-color: #0d051f; /* Darker, more saturated purple base */
          background-image:
            /* Softer, larger radial gradients for aurora effect */
            radial-gradient(ellipse at 10% 20%, hsla(280, 80%, 35%, 0.35) 0px, transparent 60%),
            radial-gradient(ellipse at 85% 30%, hsla(250, 75%, 45%, 0.3) 0px, transparent 65%),
            radial-gradient(ellipse at 50% 70%, hsla(300, 70%, 30%, 0.25) 0px, transparent 70%),
            radial-gradient(ellipse at 20% 85%, hsla(320, 75%, 40%, 0.3) 0px, transparent 60%),
            radial-gradient(ellipse at 75% 90%, hsla(260, 80%, 35%, 0.35) 0px, transparent 65%),
            /* Base linear gradient for depth */
            linear-gradient(170deg, hsla(260, 45%, 15%, 1) 0%, hsla(280,50%,20%,1) 30%, hsla(300,55%,25%,1) 70%, hsla(270,40%,10%,1) 100%);
          background-blend-mode: screen; /* Screen blend mode creates luminous effects */
        }
        @keyframes pulse { /* Renamed to soft-glow-pulse for clarity if needed elsewhere, but will override existing */
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(0.98); 
            filter: blur(5px); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.02); 
            filter: blur(3px); 
          }
        }
        .animate-pulse { /* This targets the Tailwind class used on Spheres */
          animation: pulse 7s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
