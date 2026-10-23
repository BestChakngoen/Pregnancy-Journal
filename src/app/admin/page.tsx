"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ChevronLeft, Download, ShieldCheck, UserCheck, Activity } from "lucide-react";
import { useAlertStore } from "@/lib/alertStore";

interface UserDoc {
  id: string;
  name: string;
  age: string;
  gestationalWeeks: string;
  gravida: string;
  createdAt: string;
  satisfaction?: Record<number, number>;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth for demonstration
    if (password === "admin123") {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      useAlertStore.getState().showAlert({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedUsers: UserDoc[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as UserDoc);
      });
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-slate-50 relative z-50">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-slate-800 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">เจ้าหน้าที่เท่านั้น</h1>
          <p className="text-sm text-slate-500 mb-6 text-center">เข้าสู่ระบบหลังบ้านเพื่อดูข้อมูลผู้ป่วย</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="รหัสผ่าน (admin123)"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition-all">
              เข้าสู่ระบบ
            </button>
          </form>
          
          <button onClick={() => router.push("/")} className="mt-6 text-sm text-slate-500 underline">
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 relative z-50">
      <header className="px-4 py-4 flex items-center justify-between bg-white shadow-sm sticky top-0 z-10 print:hidden">
        <button onClick={() => router.push("/")} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">ข้อมูลผู้ป่วย (Admin)</h1>
        <button 
          onClick={() => window.print()}
          className="w-10 h-10 flex items-center justify-center text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors" title="Export PDF"
        >
          <Download className="w-5 h-5" />
        </button>
      </header>

      <main className="p-4 flex flex-col gap-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <UserCheck className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold text-slate-800">{users.length}</span>
            <span className="text-xs text-slate-500">ผู้ป่วยทั้งหมด</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <Activity className="w-6 h-6 text-pink-500 mb-2" />
            <span className="text-2xl font-bold text-slate-800">0</span>
            <span className="text-xs text-slate-500">ความเสี่ยงสูง</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-slate-600 mt-2 ml-1">รายชื่อผู้ป่วยล่าสุด</h2>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">แม่{u.name}</h3>
                    <p className="text-xs text-slate-500">อายุ {u.age} ปี • ครรภ์ที่ {u.gravida}</p>
                  </div>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-lg">
                    {u.gestationalWeeks} Wk
                  </span>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <p className="text-center text-slate-500 py-8 text-sm">ยังไม่มีข้อมูลผู้ป่วย</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
