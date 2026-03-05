import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc
} from "firebase/firestore";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(collection(db, "users"), user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const defaultOrgId = "demo-org";
        const defaultRole: UserRole = "admin";
        await setDoc(userRef, {
          orgId: defaultOrgId,
          role: defaultRole,
          email: user.email,
          displayName: user.displayName || null,
          createdAt: new Date()
        });
      }

      const unsubProfile = onSnapshot(userRef, (profileSnap) => {
        const data = profileSnap.data();
        if (!data) return;
        setProfile({
          id: profileSnap.id,
          email: data.email ?? user.email,
          displayName: data.displayName ?? user.displayName,
          orgId: data.orgId,
          role: data.role
        });
        setLoading(false);
      });

      return () => unsubProfile();
    });

    return () => unsubscribe();
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

