import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2, Shield, Eye, EyeOff, CheckCircle, Users } from 'lucide-react';

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
  const [step, setStep] = useState(1); // Multi-step form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
      // Personal Info
      email: '',
      password: '',
    confirmPassword: '',
      fullName: '',
    role: 'accountant',
      
      // Organization Info
      organizationName: '',
      businessType: 'company',
      taxNumber: '',
      phone: '',
      address: '',
      
      // Agreements
    agreeToTerms: false,
      agreeToPrivacy: false,
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

  const handleBusinessTypeChange = (value: string) => {
    setFormData({
      ...formData,
      businessType: value,
    });
    if (error) setError('');
  };

  const validateStep1 = () => {
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

    return true;
  };

  const validateStep2 = () => {
    if (formData.organizationName.trim().length < 2) {
      setError('Organization name is required');
      return false;
    }

    // Terms agreement validation
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: formData.role,
        organization_name: formData.organizationName,
        business_type: formData.businessType,
        tax_number: formData.taxNumber,
        phone: formData.phone,
        address: formData.address,
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

  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <Building2 className="h-16 w-16 mr-4" />
            <h1 className="text-4xl font-bold">LedgerLink Accounting</h1>
          </div>
          <p className="text-xl text-green-100 mb-8 max-w-md">
            Join thousands of African businesses managing their finances with confidence
          </p>
          <div className="space-y-4 text-green-200">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Multi-tenant organization support</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Bank-level security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <Building2 className="h-8 w-8 mr-2 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">LedgerLink</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {step === 1 ? 'Create your account' : 'Setup your organization'}
          </CardTitle>
          <CardDescription className="text-center">
              {step === 1 
                ? 'Get started with your personal information' 
                : 'Tell us about your business'
              }
          </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center space-x-2 pt-4">
              <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
            </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
              {step === 1 && (
                <>
                  {/* Google Sign In */}
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
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with email
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
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                      placeholder="name@company.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
                    <div className="relative">
              <Input
                id="password"
                name="password"
                        type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
              
              {/* Password strength indicator */}
                    {formData.password && (
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
                    )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                      <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      placeholder="Your Company Name"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={handleBusinessTypeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Tax Number (Optional)</Label>
                    <Input
                      id="taxNumber"
                      name="taxNumber"
                      type="text"
                      placeholder="Tax identification number"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Business phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Business address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-4">
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
                        I agree to the Terms of Service
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={formData.agreeToPrivacy}
                        onCheckedChange={(checked: boolean) => 
                          setFormData({ ...formData, agreeToPrivacy: checked })
                        }
                      />
                      <label
                        htmlFor="privacy"
                        className="text-sm text-muted-foreground"
                      >
                        I agree to the Privacy Policy
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
            <Button
              type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
                  {step === 1 ? 'Continue' : 'Create Account'}
              </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter>
            <div className="text-center text-sm w-full">
            Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
              </Link>
          </div>
          </CardFooter>
      </Card>
      </div>
    </div>
  );
} 

export default SignupForm;