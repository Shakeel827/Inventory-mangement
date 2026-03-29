/**
 * AuthContext — provides Firebase auth state and Firestore user profile.
 *
 * Fixes:
 * - Proper cleanup of onSnapshot listener (was leaking due to async wrapper)
 * - 5-second timeout: if loading takes too long, force-resolve to prevent
 *   the app getting stuck on the "Loading..." screen
 * - Graceful error handling if Firestore is unreachable
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseClient";
import type { AppUserProfile, UserRole } from "../types";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AppUserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  profile: null,
  loading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Hold ref to profile listener so we can unsubscribe when user changes
  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Safety timeout — if auth check takes > 6 seconds, stop loading
    // This prevents the app getting permanently stuck on "Loading..."
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 6000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);

      // Unsubscribe previous profile listener if user changed
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(collection(db, "users"), user.uid);
        const snap = await getDoc(userRef);

        // Create default profile for new users
        if (!snap.exists()) {
          await setDoc(userRef, {
            orgId: "demo-org",
            role: "admin" as UserRole,
            email: user.email,
            displayName: user.displayName || null,
            createdAt: new Date()
          });
        }

        // Subscribe to real-time profile updates
        const unsubProfile = onSnapshot(
          userRef,
          (profileSnap) => {
            const data = profileSnap.data();
            if (!data) {
              setLoading(false);
              return;
            }
            setProfile({
              id: profileSnap.id,
              email: data.email ?? user.email,
              displayName: data.displayName ?? user.displayName,
              orgId: data.orgId,
              role: data.role
            });
            setLoading(false);
          },
          () => {
            // Firestore error (offline, rules, etc.) — stop loading gracefully
            setLoading(false);
          }
        );

        // Store unsubscribe so we can clean it up
        profileUnsubRef.current = unsubProfile;
      } catch {
        // Network error or Firestore unavailable — stop loading
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubAuth();
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
