import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { authService } from "../api/services/auth.service";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import type { UserProfileResponse } from "../interfaces/user";
import { UserEnterpriseResponse } from "../interfaces/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email?.includes("@")) {
      setErrorEmail("Please fill with a valid email");
      return false;
    }
    if (!password) {
      setErrorPassword("Password is required");
      return false;
    }
    setErrorEmail(null);
    setErrorPassword(null);
    return true;
  }

  const getUserInfo = async () => {
    const data: string | null = localStorage.getItem('currentUser');
    if (!data) {
      await authService.getCurrentUser();
      const currentUser: UserProfileResponse = JSON.parse(localStorage.getItem('currentUser') ?? '') as UserProfileResponse;
      await authService.getUserRelationEnterprise(currentUser.userId);
      const userRelationEnterprise: UserEnterpriseResponse = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? '') as UserEnterpriseResponse;
      await authService.getEnterprise(userRelationEnterprise.enterprises[0].enterpriseId);
      await authService.getMyEnterprise();
      await authService.getMyRoles();
    }
    return null;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    authService.loginUser({ email, password })
      .then(async () => {
        await getUserInfo();
        void navigate('/home');
      })
      .catch((error) => {
        console.error("Login error:", error);
        setErrorForm("Login failed. Please check your credentials.");
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-pink-600/30 -z-10" />

      {/* Floating orbs */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-75 -z-10" />

      {/* Login form - DIRECTAMENTE aquí, sin wrapper extra */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold"><strong>Welcome Back</strong></h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
              required
            />
            {errorEmail && <p className="text-red-600 text-sm">{errorEmail}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
              required
            />
            {errorPassword && <p className="text-red-600 text-sm">{errorPassword}</p>}
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
      <AlertDialog open={errorForm !== null} onOpenChange={() => setErrorForm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle> Invalid credentials</AlertDialogTitle>
            <AlertDialogDescription>
              Please check your credentials and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setErrorForm(null)
            }}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}