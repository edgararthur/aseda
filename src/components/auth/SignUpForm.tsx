import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function SignupForm() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
      email: '',
      password: '',
    confirmPassword: '',
      fullName: '',
    role: 'accountant',
    agreeToTerms: false,
  });

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update password strength when password changes
    if (name === 'password') {
      const strength = {
        hasMinLength: value.length >= PASSWORD_RULES.minLength,
        hasUpperCase: PASSWORD_RULES.hasUpperCase.test(value),
        hasLowerCase: PASSWORD_RULES.hasLowerCase.test(value),
        hasNumber: PASSWORD_RULES.hasNumber.test(value),
        hasSpecialChar: PASSWORD_RULES.hasSpecialChar.test(value),
      };

      const score = Object.values(strength).filter(Boolean).length;
      setPasswordStrength({ ...strength, score });
    }

    if (error) setError('');
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    // Email validation
    if (!EMAIL_REGEX.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Full name validation
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return false;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < PASSWORD_RULES.minLength) {
      setError(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
      return false;
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please follow the password requirements.');
      return false;
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}
            
            {/* Social Sign-in */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading}
              />
              
              {/* Password strength indicator */}
              <div className="space-y-2 text-sm">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-full rounded ${
                        i < passwordStrength.score
                          ? passwordStrength.score >= 4
                            ? 'bg-green-500'
                            : passwordStrength.score >= 3
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li className={passwordStrength.hasMinLength ? 'text-green-500' : ''}>
                    ✓ At least {PASSWORD_RULES.minLength} characters
                  </li>
                  <li className={passwordStrength.hasUpperCase ? 'text-green-500' : ''}>
                    ✓ At least one uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowerCase ? 'text-green-500' : ''}>
                    ✓ At least one lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? 'text-green-500' : ''}>
                    ✓ At least one number
                  </li>
                  <li className={passwordStrength.hasSpecialChar ? 'text-green-500' : ''}>
                    ✓ At least one special character
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked: boolean) => 
                  setFormData({ ...formData, agreeToTerms: checked })
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground"
              >
                I agree to the{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Terms of Service
                </Button>{' '}
                and{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Privacy Policy
                </Button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create account
              </Button>
            </form>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              className="px-0 font-normal"
              onClick={() => navigate('/login')}
              type="button"
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 