import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/></svg>
);
const AppleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.7 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3 .9-3.9 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.6 1.3-2.6-.1 0-2.4-.9-2.4-3.7zM14.4 5.4c.6-.8 1.1-1.9.9-3-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 2.9 1.1.1 2.3-.6 3-1.4z"/></svg>
);

const Auth = () => {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const next = params.get("next") || (isAdmin ? "/admin" : "/account");
  if (!loading && user) return <Navigate to={next} replace />;

  const submit = async (mode: "login" | "signup") => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav(next);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally { setBusy(false); }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/account`,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      nav("/account");
    } catch (e: any) {
      toast.error(e.message ?? "Sign in failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in or create your customer account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={busy} onClick={() => oauth("google")} className="gap-2"><GoogleIcon /> Google</Button>
            <Button variant="outline" disabled={busy} onClick={() => oauth("apple")} className="gap-2"><AppleIcon /> Apple</Button>
          </div>
          <div className="flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">or with email</span><Separator className="flex-1" /></div>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            {(["login","signup"] as const).map(m => (
              <TabsContent key={m} value={m} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <Button className="w-full" disabled={busy} onClick={()=>submit(m)}>
                  {m === "login" ? "Sign in" : "Create account"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
