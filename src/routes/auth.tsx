import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ShieldAlert,
  Globe,
  Fingerprint,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "ADIU | Secure Access Gateway" }] }),
  component: AuthPage,
});

/**
 * Standardized Schema
 * Uses snake_case for backend compatibility (e.g., Supabase/Pocketbase)
 */
const authSchema = z.object({
  email: z.string().trim().email("Please use a valid corporate email"),
  password: z.string().min(8, "Security requirement: Minimum 8 characters"),
  full_name: z.string().min(2, "Full name is required").optional(),
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>, type: 'in' | 'up') => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    const parsed = authSchema.safeParse(data);
    
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    
    setBusy(true);
    // Passing standardized fields to the auth hook
    const result = type === 'in' 
      ? await signIn(parsed.data.email, parsed.data.password)
      : await signUp(parsed.data.email, parsed.data.password, parsed.data.full_name);
    setBusy(false);
    
    if (result.error) return toast.error(result.error);
    toast.success(type === 'in' ? "Authentication Successful" : "Account Provisioned", {
      icon: <ShieldCheck className="h-4 w-4" />,
      duration: 3000,
    });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#050a06] dark:via-[#0a120c] dark:to-[#050a06] selection:bg-[#16301A] selection:text-white overflow-hidden relative">
      {/* Animated backdrop grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjMiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZikiLz48L3N2Zz4=')] bg-repeat" />
      
      <Toaster position="top-center" richColors closeButton />
      
      {/* LEFT PANEL: Narrative & Brand - Enhanced with glass and animations */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden group/canvas">
        <div className="absolute inset-0 z-0 transition-transform duration-[20s] group-hover/canvas:scale-105">
           <img 
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop" 
            alt="Safety Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a120c] via-[#0a120c]/80 to-[#0f1a13]/60" />
          {/* Animated beam overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6FCF97]/10 to-transparent -translate-x-full group-hover/canvas:translate-x-full transition-transform duration-[3s] ease-in-out" />
        </div>

        <div className="relative z-10 flex flex-col  gap-12 px-12 py-16 w-full max-w-[640px] mx-auto backdrop-blur-[1px]">          <div className="flex items-center gap-4 group cursor-default">
             <div className="h-14 w-14 rounded-2xl bg-[#6FCF97] flex items-center justify-center shadow-xl shadow-[#6FCF97]/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <ShieldCheck className="h-7 w-7 text-[#0d1f11]" />
             </div>
             <div>
                <span className="text-white font-black tracking-tighter text-3xl block leading-none drop-shadow-lg">ADIU Communications Service PLC</span>
                <span className="text-[#6FCF97] font-bold tracking-[0.3em] uppercase text-[11px] drop-shadow">QEHS</span>
             </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">              Safety <span className="text-white/40 font-light text-6xl">is a</span> <br /> 
              <span className="text-[#6FCF97] italic font-serif">Standard.</span>
            </h2>
            
            <div className="grid gap-6 mt-12">
               {[ 
                 { t: "Automated Hazard Reporting", d: "Deploy instant alerts across work zones with AI-drive risk scoring." },
                 { t: "Real-time Compliance", d: "Track regulatory metrics dynamically against global frameworks." },
                 { t: "Digital Permit to Work", d: "Secure, paperless authorization flows with biometric validation." }
               ].map((item, idx) => (
                 <div key={item.t} className="flex gap-4 group/item transition-all duration-300 hover:translate-x-2">
                    <div className="mt-1 h-7 w-7 rounded-full bg-[#6FCF97]/10 flex items-center justify-center border border-[#6FCF97]/30 group-hover/item:bg-[#6FCF97] transition-all duration-200">
                      <CheckCircle2 className="h-4 w-4 text-[#6FCF97] group-hover/item:text-[#0d1f11] transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-slate-100 font-bold text-base tracking-tight">{item.t}</h4>
                      <p className="text-slate-300/70 text-sm leading-relaxed">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Form - Enhanced with glass card and micro-interactions */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6FCF97]/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#16301A]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[460px] z-10 transition-all duration-500">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Welcome back
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Enter your credentials to access the system.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 dark:border-white/10 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
            <Tabs defaultValue="signin" className="w-full" onValueChange={(val) => setActiveTab(val as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/80 dark:bg-white/10 p-1 rounded-xl h-12 gap-1">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#16301A] data-[state=active]:shadow-md font-bold text-sm transition-all duration-200"
                >
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#16301A] data-[state=active]:shadow-md font-bold text-sm transition-all duration-200"
                >
                  <User className="h-3.5 w-3.5 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="animate-in fade-in zoom-in-95 duration-300">
                <form onSubmit={(e) => handleAuth(e, 'in')} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#16301A] dark:group-focus-within:text-[#6FCF97] transition-colors duration-200">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input 
                        name="email" 
                        type="email" 
                        autoComplete="email"
                        placeholder="name@adiu.com" 
                        className="h-13 pl-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl focus:ring-2 focus:ring-[#16301A]/20 dark:focus:ring-[#6FCF97]/30 transition-all duration-200 backdrop-blur-sm" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Password
                      </Label>
                      <button type="button" className="text-[11px] font-bold text-[#16301A] dark:text-[#6FCF97] hover:underline transition-all">Forgot Password?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#16301A] dark:group-focus-within:text-[#6FCF97] transition-colors duration-200">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input 
                        name="password" 
                        type="password" 
                        autoComplete="current-password"
                        placeholder="••••••••" 
                        className="h-13 pl-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl focus:ring-2 focus:ring-[#16301A]/20 dark:focus:ring-[#6FCF97]/30 transition-all duration-200 backdrop-blur-sm" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-13 bg-gradient-to-r from-[#16301A] to-[#1f4225] hover:from-[#1f4225] hover:to-[#2a5a31] text-white rounded-xl shadow-xl shadow-[#16301A]/30 transition-all duration-300 active:scale-[0.98] font-bold text-base gap-2 group/btn" 
                    disabled={busy}
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-in fade-in zoom-in-95 duration-300">
                <form onSubmit={(e) => handleAuth(e, 'up')} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                      <User className="h-3 w-3" /> Full Name
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#16301A] dark:group-focus-within:text-[#6FCF97] transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <Input 
                        name="full_name" 
                        autoComplete="name"
                        placeholder="Authorized Name" 
                        className="h-13 pl-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl focus:ring-2 focus:ring-[#16301A]/20 dark:focus:ring-[#6FCF97]/30 backdrop-blur-sm" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#16301A] dark:group-focus-within:text-[#6FCF97] transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input 
                        name="email" 
                        type="email" 
                        autoComplete="email"
                        placeholder="name@adiu.com" 
                        className="h-13 pl-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl focus:ring-2 focus:ring-[#16301A]/20 dark:focus:ring-[#6FCF97]/30 backdrop-blur-sm" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Create Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#16301A] dark:group-focus-within:text-[#6FCF97] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input 
                        name="password" 
                        type="password" 
                        autoComplete="new-password"
                        placeholder="Min. 8 characters" 
                        className="h-13 pl-11 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl focus:ring-2 focus:ring-[#16301A]/20 dark:focus:ring-[#6FCF97]/30 backdrop-blur-sm" 
                        required 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-4 mt-1">Use at least 8 characters with a mix of letters & numbers</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-13 bg-gradient-to-r from-[#16301A] to-[#1f4225] hover:from-[#1f4225] hover:to-[#2a5a31] text-white rounded-xl shadow-xl shadow-[#16301A]/30 transition-all duration-300 active:scale-[0.98] font-bold text-base" 
                    disabled={busy}
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Create Account <Sparkles className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-sm">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ADIU Communication Service PLC
              </p>
              <p className="text-[10px] text-slate-400/60">
                © {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}