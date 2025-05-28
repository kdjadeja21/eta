"use client";

import { useEffect } from "react";
import { useAuth, useSignIn, useUser } from "@clerk/nextjs";
import { showSuccessToast } from "@/components/ui/toast";

export function AuthToast() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signIn } = useSignIn();

  useEffect(() => {
    // Wait for Clerk to load and have user data
    if (!isLoaded) return;

    // Get stored state
    const lastAuthState = localStorage.getItem("lastAuthState") || "initial";
    const currentAuthState = isSignedIn ? "signedIn" : "signedOut";

    // Update stored state immediately to prevent duplicate toasts
    localStorage.setItem("lastAuthState", currentAuthState);

    // Only show toasts when there's a state change
    if (lastAuthState !== currentAuthState) {
      // Handle sign in
      if (isSignedIn && user) {
        // Check if user was created in the last minute (new user)
        const isNewUser =
          user.createdAt &&
          Date.now() - new Date(user.createdAt).getTime() < 60000;

        if (lastAuthState === "initial" || lastAuthState === "signedOut") {
          if (isNewUser) {
            showSuccessToast(`Welcome ${user.firstName || ""}!`, {
              description:
                "Your account has been created successfully. Let's start tracking your expenses.",
              duration: 5000,
            });
          } else {
            showSuccessToast(`Welcome back ${user.firstName || ""}!`, {
              description: "You've successfully signed in to your account.",
              duration: 3000,
            });
          }
        }
      }
      // Handle sign out
      else if (lastAuthState === "signedIn" && !isSignedIn) {
        showSuccessToast("Signed out successfully", {
          description: "You've been securely logged out.",
          duration: 3000,
        });
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
