// src/lib/userStore.ts
// à¹€à¸£à¸²à¹ƒà¸Šà¹‰ localStorage à¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸³à¸„à¹ˆà¸²à¸§à¹ˆà¸²à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸„à¸™à¸™à¸µà¹‰à¸Šà¸·à¹ˆà¸­à¸­à¸°à¹„à¸£ à¹à¸¥à¸°à¹€à¸„à¸¢à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¹à¸¥à¹‰à¸§à¸«à¸£à¸·à¸­à¸¢à¸±à¸‡
"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
 name: string;
 age: string;
 gestationalWeeks: string;
 gravida: string;
}

export function useUserStore() {
 const [user, setUser] = useState<UserProfile | null>(null);
 const [isLoaded, setIsLoaded] = useState(false);

 // à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸²à¸ LocalStorage à¸•à¸­à¸™à¹€à¸›à¸´à¸”à¹à¸­à¸›
 useEffect(() => {
 const savedUser = localStorage.getItem("bumply_user");
 if (savedUser) {
 try {
 setUser(JSON.parse(savedUser));
 } catch (e) {
 console.error("Failed to parse user from local storage");
 }
 }
 setIsLoaded(true);
 }, []);

 const loginOrSaveUser = (profile: UserProfile) => {
 // 1. Save locally
 localStorage.setItem("bumply_user", JSON.stringify(profile));
 setUser(profile);
 };

 const logout = () => {
 localStorage.removeItem("bumply_user");
 setUser(null);
 };

 return { user, isLoaded, loginOrSaveUser, logout };
}
