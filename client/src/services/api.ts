import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PROD_URL = 'https://challengefit.beardmachinegames.duckdns.org/api';

// Dynamically extract the Metro host IP (e.g. 192.168.x.x or 10.0.2.2 for emulator)
const debuggerHost = Constants.expoConfig?.hostUri;
const devHost = debuggerHost
  ? debuggerHost.split(':')[0]
  : Platform.OS === 'android'
  ? '10.0.2.2'
  : 'localhost';

const API_BASE_URL = __DEV__
  ? `http://${devHost}:3001/api`
  : PROD_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const missionApi = {
  getTodayMissions: async () => {
    const response = await api.get('/missions/today');
    return response.data;
  },
  completeMission: async (id: string, flex: boolean = false) => {
    const response = await api.post(`/missions/${id}/complete?flex=${flex}`);
    return response.data;
  },
  refreshMission: async (id: string) => {
    const response = await api.post(`/missions/${id}/refresh`);
    return response.data;
  },
  snoozeMission: async (id: string) => {
    const response = await api.post(`/missions/${id}/snooze`);
    return response.data;
  },
  validateMission: async (id: string, steps: number) => {
    const response = await api.post(`/missions/${id}/validate`, { steps });
    return response.data;
  },
  getBonusMission: async () => {
    const response = await api.post('/missions/bonus');
    return response.data;
  },
  updateAvailability: async (startTime: string, endTime: string) => {
    const response = await api.post('/missions/availability', { startTime, endTime });
    return response.data;
  }
};

export const socialApi = {
  getFriends: async () => {
    const response = await api.get('/social/friends');
    return response.data;
  },
  getFeed: async () => {
    const response = await api.get('/social/feed');
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get('/social/leaderboard');
    return response.data;
  },
  getGroups: async () => {
    const response = await api.get('/social/groups');
    return response.data;
  },
  createGroup: async (name: string, memberIds: string[]) => {
    const response = await api.post('/social/groups', { name, memberIds });
    return response.data;
  },
  getGroupLeaderboard: async (groupId: string) => {
    const response = await api.get(`/social/groups/${groupId}/leaderboard`);
    return response.data;
  },
};

export default api;
