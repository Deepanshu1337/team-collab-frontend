import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import type { RootState } from "../../store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useFormik } from "formik";
import toast from "react-hot-toast";

const SignUp = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.name.trim()) errors.name = "Full name is required";
      if (!values.email.trim()) errors.email = "Email is required";
      if (!values.password) errors.password = "Password is required";
      if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match";
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);

      const syncUserWithBackend = async (idToken: string, retries = 1) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Backend sync failed");
          }
        } catch (err) {
          if (retries > 0) {
            // ⏳ wait for Render cold start
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return syncUserWithBackend(idToken, retries - 1);
          }
          throw err;
        }
      };

      try {
        // 1️⃣ Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);

        // 2️⃣ Update profile
        await updateProfile(userCredential.user, {
          displayName: values.name.trim(),
        });

        // 3️⃣ Reload user
        await userCredential.user.reload();

        // 4️⃣ Get ID token
        const idToken = await userCredential.user.getIdToken(true);

        // 5️⃣ Sync with backend
        await syncUserWithBackend(idToken);

        toast.success("Account created successfully!");
        navigate("/dashboard");
      } catch (err) {
        // ❌ No Firebase-specific errors exposed
        const message =
          err instanceof Error && err.message.includes("Backend")
            ? "Account created, server is waking up. Please refresh."
            : "Something went wrong. Please try again.";

        setError(message);
        toast.error(message);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              TeamCollab
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Join our collaboration platform</p>
        </div>

        {/* Signup Card */}
        <Card className="card-gradient border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-slate-400">Join your team and start collaborating</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg px-4 py-3 flex gap-3">
                <AlertCircle className="h-5 w-5 text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-danger-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4 text-primary-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="John Doe"
                  className={formik.touched.name && formik.errors.name ? "border-danger-500/50" : ""}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-danger-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-primary-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@example.com"
                  className={formik.touched.email && formik.errors.email ? "border-danger-500/50" : ""}
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
                <Label htmlFor="password" className="flex items-center gap-2 text-slate-300">
                  <Lock className="h-4 w-4 text-primary-400" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Min 6 chars, mix of upper/lower/numbers"
                  className={formik.touched.password && formik.errors.password ? "border-danger-500/50" : ""}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-danger-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-primary-400" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Re-enter your password"
                  className={
                    formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-danger-500/50" : ""
                  }
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-danger-400 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 mt-6"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Already have account */}
            <div className="text-center text-sm pt-4 border-t border-slate-700">
              <span className="text-slate-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By signing up, you agree to our{" "}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
