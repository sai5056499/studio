
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
    className="absolute rounded-full opacity-60 animate-pulse"
    style={{
      width: size,
      height: size,
      background: color,
      top,
      left,
      right,
      bottom,
      animationDuration: '5s',
      animationDelay: animationDelay || '0s',
      filter: 'blur(4px)'
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
      <Sphere size="150px" color="radial-gradient(circle, rgba(170,100,255,0.7) 0%, rgba(100,100,255,0.3) 100%)" top="10%" left="5%" animationDelay="0s" />
      <Sphere size="80px" color="radial-gradient(circle, rgba(100,200,255,0.6) 0%, rgba(150,100,255,0.2) 100%)" top="60%" left="15%" animationDelay="1s" />
      <Sphere size="120px" color="radial-gradient(circle, rgba(200,100,255,0.5) 0%, rgba(100,150,255,0.3) 100%)" top="20%" right="10%" animationDelay="0.5s" />
      <Sphere size="60px" color="radial-gradient(circle, rgba(150,150,255,0.7) 0%, rgba(200,100,200,0.2) 100%)" bottom="15%" right="20%" animationDelay="1.5s" />
      <Sphere size="200px" color="radial-gradient(circle, rgba(120,80,220,0.4) 0%, rgba(80,120,220,0.1) 100%)" bottom="5%" left="25%" animationDelay="0.2s" />
      
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
          background-color: #1a0537; /* Deep purple fallback */
          background-image: 
            radial-gradient(at 10% 15%, hsla(280, 60%, 30%, 0.45) 0px, transparent 50%),
            radial-gradient(at 85% 25%, hsla(250, 70%, 40%, 0.35) 0px, transparent 50%),
            radial-gradient(at 50% 60%, hsla(300, 50%, 25%, 0.3) 0px, transparent 50%),
            radial-gradient(at 15% 80%, hsla(320, 65%, 35%, 0.4) 0px, transparent 50%),
            radial-gradient(at 80% 85%, hsla(260, 60%, 30%, 0.45) 0px, transparent 50%),
            linear-gradient(160deg, #2c0b58 0%, #4a00e0 30%, #6d23b6 70%, #1a0537 100%);
          background-blend-mode: screen;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
