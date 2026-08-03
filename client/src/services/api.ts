import axios from 'axios';
import { Platform } from 'react-native';

/**
 * For Android Emulators, 'localhost' refers to the device itself.
 * We must use '10.0.2.2' to refer to the host machine.
 * For physical devices, use your machine's local IP (e.g., 192.168.x.x).
 */
const DEV_IP = '192.168.1.207'; // Using host IP for cross-device compatibility
const API_BASE_URL = `http://${Platform.OS === 'android' ? DEV_IP : 'localhost'}:3000/api`;

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
