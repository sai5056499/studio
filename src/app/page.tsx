
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
    className={`relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl ${className}`} // backdrop-blur-lg for more pronounced effect
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
      
      <div // Decorative abstract shapes, made part of the flow to avoid z-index issues with main content
        className="absolute inset-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute w-[500px] h-[400px] -rotate-[25deg] top-[10%] left-[calc(50%-500px)] opacity-30 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full filter blur-xl" data-ai-hint="abstract light" />
        <div className="absolute w-[450px] h-[350px] rotate-[30deg] bottom-[15%] right-[calc(50%-450px)] opacity-25 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full filter blur-2xl" data-ai-hint="blur shape" />
      </div>


      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20"> {/* Increased z-index */}
        <Link href="/" className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold">Content Ally</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="#features" className="text-sm hover:underline hidden md:block">
            Features
          </Link>
          <Button asChild variant="outline" className="bg-white/15 border-white/40 hover:bg-white/25 text-white backdrop-blur-md shadow-md"> {/* Slightly more opaque */}
            <Link href="/dashboard">Launch App</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center flex-grow pt-24 pb-12 md:pt-32 md:pb-16"> {/* Increased padding */}
        <GlassShape className="px-8 py-12 md:px-16 md:py-20 max-w-3xl"> {/* Increased internal padding */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 leading-tight drop-shadow-md"> {/* Increased margin */}
            Intelligent <span className="text-purple-300">Content</span>,
            <br className="hidden md:block" /> Effortless <span className="text-blue-300">Planning</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 md:mb-12 max-w-xl mx-auto drop-shadow-sm"> {/* Increased margin */}
            Content Ally is your AI-powered suite for seamless content creation, task management, and productivity enhancement.
            Unlock your potential.
          </p>
          <Button size="lg" asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg px-10 py-7 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"> {/* Larger padding, hover effect */}
            <Link href="/dashboard">
              Get Started <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </GlassShape>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-6xl py-12 md:py-20"> {/* Increased padding */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">Explore Content Ally Features</h2> {/* Increased margin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"> {/* Increased gap */}
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href} legacyBehavior>
                <a className="block p-6 bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 group"> {/* Enhanced glassmorphism & hover */}
                  <div className="flex items-center mb-4"> {/* Increased margin */}
                    <Icon className="h-8 w-8 text-purple-300 mr-4" /> {/* Slightly larger icon */}
                    <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-5 min-h-[40px]">{item.description}</p> {/* Increased margin, min-height for alignment */}
                  <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200 group-hover:underline flex items-center transition-colors"> {/* Slightly larger text, color change on hover */}
                    Go to {item.label} <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            radial-gradient(ellipse at 10% 20%, hsla(280, 80%, 35%, 0.45) 0px, transparent 60%), /* Increased opacity */
            radial-gradient(ellipse at 85% 30%, hsla(250, 75%, 45%, 0.4) 0px, transparent 65%), /* Increased opacity */
            radial-gradient(ellipse at 50% 70%, hsla(300, 70%, 30%, 0.35) 0px, transparent 70%), /* Increased opacity */
            radial-gradient(ellipse at 20% 85%, hsla(320, 75%, 40%, 0.4) 0px, transparent 60%), /* Increased opacity */
            radial-gradient(ellipse at 75% 90%, hsla(260, 80%, 35%, 0.45) 0px, transparent 65%), /* Increased opacity */
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

