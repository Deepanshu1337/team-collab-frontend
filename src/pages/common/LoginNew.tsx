import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

const LoginNew = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast.success('Login successful! Redirecting...');
      } catch (err: any) {
        const errorCode = err.code;
        let errorMessage = 'Login failed';
        if (errorCode === 'auth/user-not-found') {
          errorMessage = 'Email not registered. Would you like to create an account?';
        } else if (errorCode === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorCode === 'auth/too-many-requests') {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        helpers.setSubmitting(false);
      }
    }
  });


  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                TeamCollab
              </h1>
              <p className="text-xs text-slate-500 mt-1">Real-time Collaboration</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="card-gradient border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg px-4 py-3 flex gap-3">
                <AlertCircle className="h-5 w-5 text-danger-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-danger-300 text-sm font-medium">{error}</p>
                  {error.includes('registered') && (
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-primary-400 hover:text-primary-300 text-xs mt-1 underline transition-colors"
                    >
                      Create account instead
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-300 font-medium">
                  <Mail className="h-4 w-4 text-primary-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@example.com"
                  disabled={formik.isSubmitting}
                  className="bg-slate-800/50 border-slate-700/60 focus:ring-primary-500"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-danger-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2 text-slate-300 font-medium">
                    <Lock className="h-4 w-4 text-primary-400" />
                    Password
                  </Label>
                  <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your password"
                    disabled={formik.isSubmitting}
                    className="bg-slate-800/50 border-slate-700/60 focus:ring-primary-500 pr-10"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-danger-400 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {formik.errors.password}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 mt-6 flex items-center justify-center gap-2"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm pt-4 border-t border-slate-700">
              <span className="text-slate-400">
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginNew;
