import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import PhoneInputField from "./assets/PhoneInput";
import { useState } from "react";

export function SignupPage() {
  const navigate = useNavigate();

  /**
   * 
   * @todo handle submit on sign up form
   */

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});



  const passwordValidator = (confirm: string): string | boolean => {
    if (password !== confirm) {
      return "Password don't match" 
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character"
    } 
    return true;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) {newErrors.firstName = "First name is required";}
    if (!lastName.trim()) {newErrors.lastName = "Last name is required";}
    if (!dateOfBirth) {newErrors.dateOfBirth = "Date of birth is required";}
    if (!email.trim()) {newErrors.email = "Email is required";}
    if (!phoneNumber || phoneNumber.trim().length === 0) {newErrors.phoneNumber = "Phone number is required";}
    const passwordValidation = passwordValidator(confirmPassword);
    if (passwordValidation !== true) {
      newErrors.password = passwordValidation as string;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const formData = {
    firstName,
    lastName,
    dateOfBirth,
    email,
    phoneNumber,
    password
    };
    console.warn('Form Data:', formData);
    void navigate('/home'); // Redirigir al home después de registrarse
  };

  return (
    <div className="size-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-600/30 dark:via-blue-600/30 dark:to-purple-600/30" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-green-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-75" />
      
      {/* Signup form */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join our community today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                  required
                />
                {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                  required
                />
                {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
        )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birthdate</Label>
              <Input
                id="birthDate"
                type="date"
                placeholder="mm/dd/yyyy"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                required
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <PhoneInputField
              value={phoneNumber}
              onChange={setPhoneNumber}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
                value={confirmPassword}
                onChange={(e) => {setConfirmPassword(e.target.value)}}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
        )}
            </div>
            
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/')} // Ir al login
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}