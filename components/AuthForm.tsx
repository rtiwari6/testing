"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { provider, auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmbedded } from "@/lib/utils";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, signInWithRedirect,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const result = await signUp({
          uid: userCred.user.uid,
          name: name!,
          email,
          password,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCred.user.getIdToken();
        await signIn({ email, idToken });
        toast.success("Signed in successfully");
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      switch (error.code) {
        case "auth/wrong-password":
          toast.error("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Account temporarily locked.");
          break;
        default:
          toast.error("Sign-in failed. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    // 1) If we detect an embedded in-app WebView, escape to /google-external
    if (typeof window !== 'undefined' && isEmbedded()) {
      window.open('/google-external', '_blank', 'noopener,noreferrer');
      return;
    }

    // 2) Otherwise, try the standard popup flow
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await signIn({ email: result.user.email!, idToken });
      toast.success('Signed in with Google');
      router.push('/');
    } catch (err: any) {
      // If popup is blocked (Safari iOS), fall back to full-page redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
        return;
      }
      console.error(err);
      toast.error('Google sign-in failed');
    }
  };



  const isSignIn = type === "sign-in";

  return (
      <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
          {/* Logo & Title */}
          <div className="flex gap-2 justify-center items-center">
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
            <h2 className="text-primary-100">MOCKLY</h2>
          </div>
          <h3 className="text-center">AI-Powered Interview Mastery</h3>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form">
              {!isSignIn && (
                  <FormField
                      control={form.control}
                      name="name"
                      label="Name"
                      placeholder="Your name"
                      type="text"
                  />
              )}
              <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Email Address"
                  type="email"
              />
              <FormField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
              />
              <Button className="btn w-full" type="submit">
                {isSignIn ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Divider with “OR” */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-input/50" />
            <span className="mx-2 text-light-100">OR</span>
            <hr className="flex-grow border-input/50" />
          </div>

          {/* Google Sign-In */}
          <Button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            
            <img
                src="/google.svg"
                alt="Google logo"
                className="w-5 h-5"
            />
            Continue with Google
          </Button>

          {/* Switch to Sign Up / Sign In Link */}
          <p className="text-center mt-4">
            {isSignIn ? "No account yet?" : "Have an account already?"}{" "}
            <Link
                href={isSignIn ? "/sign-up" : "/sign-in"}
                className="font-bold text-user-primary"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
  );
};

export default AuthForm;
