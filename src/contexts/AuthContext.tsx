import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  inviteAdmin: (email: string, password: string, name: string, invitedByUid: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Ellenőrizzük, hogy a user admin-e
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data() as DocumentData;
            setUserProfile({
              email: data.email,
              name: data.name,
              uid: data.uid
            });
            setIsAdmin(true);
          } else {
            // Ha a user nincs az admins collection-ben, kijelentkeztetjük
            setUserProfile(null);
            setIsAdmin(false);
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ellenőrizzük hogy admin-e
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('Nincs jogosultságod az admin felülethez');
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } catch (error) {
      throw error;
    }
  };

  // Admin meghívó funkció - új admin létrehozása
  const inviteAdmin = async (
    email: string,
    password: string,
    name: string,
    invitedByUid: string
  ): Promise<User> => {
    try {
      // Másodlagos Firebase app létrehozása, hogy ne jelentkeztesse ki a jelenlegi admint
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      // Másodlagos app létrehozása
      const secondaryApp: FirebaseApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      // Új Firebase user létrehozása a másodlagos app-ban
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      // Admin profil létrehozása Firestore-ban
      await setDoc(doc(db, 'admins', newUser.uid), {
        uid: newUser.uid,
        email: email,
        name: name,
        createdAt: serverTimestamp(),
        invitedBy: invitedByUid
      });

      // Másodlagos app törlése (cleanup)
      await deleteApp(secondaryApp);

      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    login,
    logout,
    inviteAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
