import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
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
            setUserProfile(adminDoc.data());
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

  const login = async (email, password) => {
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

  const logout = async () => {
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
  const inviteAdmin = async (email, password, name, invitedByUid) => {
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
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
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

  const value = {
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
