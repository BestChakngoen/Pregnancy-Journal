"use client";

import { useEffect, useState } from "react";

export interface TrackingData {
  bloodPressure: string; // e.g. "120/80"
  bpLastUpdated: string; // e.g. "วันนี้ 08:00"
  weight: number;
  weightLastUpdated: string;
  kicks: number;
}

const defaultData: TrackingData = {
  bloodPressure: "-",
  bpLastUpdated: "-",
  weight: 0,
  weightLastUpdated: "-",
  kicks: 0,
};

export function useTrackingStore() {
  const [data, setData] = useState<TrackingData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bumply_tracking_data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tracking data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToLocal = (newData: TrackingData) => {
    localStorage.setItem("bumply_tracking_data", JSON.stringify(newData));
    setData(newData);
  };

  const updateBloodPressure = (bp: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    saveToLocal({ ...data, bloodPressure: bp, bpLastUpdated: `วันนี้ ${timeStr}` });
  };

  const updateWeight = (w: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    saveToLocal({ ...data, weight: w, weightLastUpdated: `วันนี้ ${timeStr}` });
  };

  const addKick = () => {
    saveToLocal({ ...data, kicks: data.kicks + 1 });
  };
  const removeKick = () => {
    saveToLocal({ ...data, kicks: Math.max(0, data.kicks - 1) });
  };
  const resetDaily = () => {
    saveToLocal({ ...data, kicks: 0 });
  };

  return { 
    data, 
    isLoaded, 
    updateBloodPressure, 
    updateWeight, 
    addKick,
    removeKick,
    resetDaily
  };
}
