import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, user, loading } = useAuth();
  const [error, setError] = useState('');
  const form = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' },
  });

  const navigate = useNavigate();

  const handleSubmit = async (data: LoginFormData) => {
      try {
          await signIn(data.email, data.password);
      } catch (err) {
          setError(`Failed to sign in: ${err.message}`);
          console.error('Sign in error:', err);
      }
  };

  useEffect(() => {
      if (user && !loading) {
          navigate('/');
      }
  }, [user, loading, navigate]);

  return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <Card className="w-full max-w-md">
              <CardHeader className="space-y-4 text-center">
                  <div className="flex justify-center">
                      <Building2 className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                          {error && <p className="text-red-500">{error}</p>}
                          <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                          <Input placeholder="name@company.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Password</FormLabel>
                                      <FormControl>
                                          <Input type="password" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <Button type="submit" className="w-full" disabled={loading}>
                              {loading ? 'Signing In...' : 'Sign In'}
                          </Button>
                      </form>
                  </Form>
              </CardContent>
          </Card>
      </div>
  );
}