"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage, TRANSLATIONS } from "@/lib/i18n";
import { signInWithGoogle, signOutUser, subscribeToAuthState, UserProfile } from "@/services/authService";

interface SettingsContextType {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhoto: string | null;
  isGmailAuthenticated: boolean;
  setUserName: (name: string) => void;
  signInWithGmail: () => Promise<UserProfile>;
  signOutGmail: () => Promise<void>;
  medicalHistory: string;
  setMedicalHistory: (history: string) => void;
  hospitalApiKey: string;
  generateNewApiKey: () => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  const [userId, setUserId] = useState<string>("aether_usr_8f92a170b4c2");
  const [userName, setUserNameState] = useState<string>("Alex Rivers");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGmailAuthenticated, setIsGmailAuthenticated] = useState<boolean>(false);

  const [medicalHistory, setMedicalHistoryState] = useState<string>(
    "34-year-old patient with history of mild seasonal asthma, penicillin allergy, and previous high blood pressure episodes during stress."
  );
  const [hospitalApiKey, setHospitalApiKey] = useState<string>("aether_ehr_live_sec_9941a8");

  useEffect(() => {
    // Load from localStorage if present
    const savedTheme = localStorage.getItem("aether_theme") as "dark" | "light";
    const savedLang = localStorage.getItem("aether_lang") as SupportedLanguage;
    const savedName = localStorage.getItem("aether_user_name");
    const savedHistory = localStorage.getItem("aether_medical_history");

    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
      document.body.classList.toggle("light", savedTheme === "light");
    }
    if (savedLang) {
      setLanguageState(savedLang);
    }
    if (savedName) {
      setUserNameState(savedName);
    }
    if (savedHistory) {
      setMedicalHistoryState(savedHistory);
    }

    // Subscribe to Firebase Auth (Gmail OAuth) state changes
    const unsubscribe = subscribeToAuthState((profile) => {
      if (profile) {
        setIsGmailAuthenticated(true);
        setUserEmail(profile.email);
        setUserPhoto(profile.photoURL);
        if (profile.displayName) {
          setUserNameState(profile.displayName);
        }
        setUserId(`aether_usr_${profile.uid.substring(0, 12)}`);
      } else {
        setIsGmailAuthenticated(false);
        setUserEmail(null);
        setUserPhoto(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const setTheme = (newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    localStorage.setItem("aether_theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.body.classList.toggle("light", newTheme === "light");
  };

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    localStorage.setItem("aether_lang", newLang);
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("aether_user_name", name);
  };

  const signInWithGmail = async (): Promise<UserProfile> => {
    const profile = await signInWithGoogle();
    setIsGmailAuthenticated(true);
    setUserEmail(profile.email);
    setUserPhoto(profile.photoURL);
    if (profile.displayName) {
      setUserNameState(profile.displayName);
    }
    setUserId(`aether_usr_${profile.uid.substring(0, 12)}`);
    return profile;
  };

  const signOutGmail = async (): Promise<void> => {
    await signOutUser();
    setIsGmailAuthenticated(false);
    setUserEmail(null);
    setUserPhoto(null);
    setUserNameState("Alex Rivers");
    setUserId("aether_usr_8f92a170b4c2");
  };

  const setMedicalHistory = (history: string) => {
    setMedicalHistoryState(history);
    localStorage.setItem("aether_medical_history", history);
  };

  const generateNewApiKey = () => {
    const newKey = `aether_ehr_live_sec_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
    setHospitalApiKey(newKey);
  };

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS["en"];
    return dict[key] || TRANSLATIONS["en"][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        userId,
        userName,
        userEmail,
        userPhoto,
        isGmailAuthenticated,
        setUserName,
        signInWithGmail,
        signOutGmail,
        medicalHistory,
        setMedicalHistory,
        hospitalApiKey,
        generateNewApiKey,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
