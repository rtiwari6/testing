"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Helper: create & set the session cookie
async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

// Sign up new user (email/password)
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return { success: false, message: "User already exists. Please sign in." };
    }
    await db.collection("users").doc(uid).set({ name, email });
    return { success: true, message: "Account created. Please sign in." };
  } catch (error: any) {
    console.error("Error in signUp:", error);
    return { success: false, message: "Failed to create account." };
  }
}

// Sign in existing user (email/password or Google)
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  try {
    // Look up the Firebase Auth record
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return { success: false, message: "User does not exist. Create an account." };
    }

    // Set the session cookie
    await setSessionCookie(idToken);

    // Ensure we have a Firestore user document
    const userDocRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      await userDocRef.set({
        name: userRecord.displayName || "",
        email: userRecord.email || email,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in signIn:", error);
    return { success: false, message: "Failed to log in. Please try again." };
  }
}

// Sign out by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Get current user from the session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...(userDoc.data() as Omit<User, "id">) };
  } catch (error) {
    console.error("Invalid or expired session:", error);
    return null;
  }
}

// Helper to check auth status
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
