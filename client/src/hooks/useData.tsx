import React, { createContext, useContext, useState, useEffect } from 'react';
import { missionApi } from '../services/api';
import { Mission } from '../types';
import { useAuth } from './useAuth';

type DataContextType = {
  missions: Mission[];
  userStats: { xp: number; level: number; streak: number; availability: any };
  allCompleted: boolean;
  refreshData: () => Promise<void>;
  updateMissionStatus: (id: string, status: string) => void;
  setUserStats: (stats: any) => void;
  setAllCompleted: (val: boolean) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userStats, setUserStatsState] = useState({ xp: 0, level: 0, streak: 0, availability: null });
  const [allCompleted, setAllCompleted] = useState(false);

  const refreshData = async () => {
    if (!user) return;
    try {
      const data = await missionApi.getTodayMissions();
      setMissions(data.missions);
      setUserStatsState(data.user);
      setAllCompleted(data.allCompleted);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const updateMissionStatus = (id: string, status: any) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const setUserStats = (stats: any) => {
    setUserStatsState(prev => ({ ...prev, ...stats }));
  };

  useEffect(() => {
    if (user) {
        refreshData();
    } else {
        setMissions([]);
        setUserStatsState({ xp: 0, level: 0, streak: 0, availability: null });
        setAllCompleted(false);
    }
  }, [user]);

  return (
    <DataContext.Provider value={{
      missions,
      userStats,
      allCompleted,
      refreshData,
      updateMissionStatus,
      setUserStats,
      setAllCompleted
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
