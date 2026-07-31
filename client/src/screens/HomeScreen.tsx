import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { missionApi } from '../services/api';
import { Mission } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { movementService } from '../services/MovementService';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const { colors } = useTheme();
  const { missions, userStats, allCompleted, refreshData, updateMissionStatus, setUserStats, setAllCompleted } = useData();
  const [flexMode, setFlexMode] = useState(false);
  const [movementState, setMovementState] = useState(movementService.getMovementState());

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    const scheduleMissions = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();

      missions.forEach(async (mission) => {
        if (mission.status !== 'PENDING') return;

        // Parse bracket start time (e.g., "09:00")
        const [hours, minutes] = mission.bracket.start.split(':').map(Number);
        const trigger = new Date();
        trigger.setHours(hours || 0, minutes || 0, 0, 0);

        // If the time has already passed today, don't schedule
        if (trigger < now) return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Fitness Quest! 🎯",
            body: `Time to do your ${mission.exerciseId.replace('-', ' ')}! 💪`,
            data: { missionId: mission.id },
          },
          trigger,
        });
      });
    };

    // Check for immediate toast if app is open
    const checkRequiredMissions = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      missions.forEach(mission => {
        if (mission.status === 'PENDING' && currentTime === mission.bracket.start) {
          if (movementService.isAvailableForMission()) {
            Toast.show({
              type: 'info',
              text1: 'Exercise Required!',
              text2: `You've been stationary for ${movementService.getStationaryMinutes()}m. Time for ${mission.exerciseId.replace('-', ' ')}! 💪`,
              visibilityTime: 10000,
            });
          }
        }
      });
    };

    setupNotifications();
    scheduleMissions();
    refreshData();

    const interval = setInterval(checkRequiredMissions, 60000);
    return () => clearInterval(interval);
  }, [missions]);

  const toggleMovement = async () => {
    const nextState = movementState === 'STILL' ? 'MOVING' : 'STILL';
    await movementService.setMovementState(nextState);
    setMovementState(nextState);

    Toast.show({
        type: 'info',
        text1: 'Movement Simulated',
        text2: `You are now ${nextState}.`,
    });
  };

  const mockLongStationary = () => {
      movementService.setMockStationarySince(45);
      setMovementState('STILL');
      Toast.show({
          type: 'success',
          text1: 'Time Warp!',
          text2: 'Simulated 45 minutes of being still.',
      });
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await missionApi.completeMission(id, flexMode);
      updateMissionStatus(id, 'COMPLETED');
      setUserStats({
        ...userStats,
        xp: response.newTotalXP,
        level: response.newLevel,
      });
      setAllCompleted(response.allCompleted);

      if (response.allCompleted) {
        Toast.show({
          type: 'success',
          text1: '🏆 WELL DONE!',
          text2: "You've completed all of today's exercises!",
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Mission Complete!',
          text2: `You earned ${response.xpEarned} XP!`,
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error completing mission';
      Toast.show({
        type: 'error',
        text1: 'Action Required',
        text2: msg,
      });
      refreshData();
    }
  };

  const handleRefresh = async (id: string) => {
    try {
      const response = await missionApi.refreshMission(id);
      await refreshData();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Mission refreshed!',
      });
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error refreshing mission';
      Toast.show({
        type: 'info',
        text1: 'Cooldown Active',
        text2: msg,
      });
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      await missionApi.snoozeMission(id);
      await refreshData();
      Toast.show({
        type: 'success',
        text1: 'Snoozed',
        text2: 'You have 15 more minutes!',
      });
    } catch (error: any) {
        const msg = error.response?.data?.error || 'Error snoozing mission';
        Toast.show({
            type: 'error',
            text1: 'Limit Reached',
            text2: msg,
        });
    }
  };

  const renderMission = ({ item, index }: { item: Mission, index: number }) => {
    const isCompleted = item.status === 'COMPLETED';
    const isMissed = item.status === 'MISSED';
    const isNext = !isCompleted && !isMissed && (index === 0 || missions[index - 1]?.status === 'COMPLETED');

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isInsideBracket = currentTime >= item.bracket.start && currentTime <= item.bracket.end;

    return (
      <View style={[
          styles.card, 
          { backgroundColor: colors.card }, 
          isCompleted && { backgroundColor: colors.background, opacity: 0.8 },
          isMissed && { borderColor: '#e74c3c', borderWidth: 1, opacity: 0.7 }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[
              styles.bracket, 
              { color: colors.secondary }, 
              isCompleted && { color: colors.success },
              isMissed && { color: '#e74c3c' }
          ]}>
            {item.bracket.start} - {item.bracket.end}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isCompleted && <Text style={[styles.doneBadge, { color: colors.success }]}>DONE</Text>}
            {isMissed && <Text style={[styles.doneBadge, { color: '#e74c3c' }]}>MISSED</Text>}
            {!isCompleted && !isMissed && (
              <TouchableOpacity onPress={() => handleRefresh(item.id)}>
                <Text style={styles.refreshIcon}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[
            styles.exerciseName, 
            { color: colors.text }, 
            !isNext && !isCompleted && !isMissed && { color: colors.subtext },
            isMissed && { textDecorationLine: 'line-through' }
        ]}>
          {item.exerciseId.replace('-', ' ').toUpperCase()}
        </Text>

        {!isCompleted && !isMissed && (isNext || flexMode) && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
                style={[
                    styles.completeButton, 
                    { backgroundColor: colors.secondary, flex: 2 }, 
                    (!isInsideBracket && !flexMode) && { backgroundColor: colors.subtext }
                ]}
                onPress={() => handleComplete(item.id)}
            >
                <Text style={styles.buttonText}>
                {flexMode ? 'COMPLETE EARLY' : 'COMPLETE'}
                </Text>
            </TouchableOpacity>
            
            {isInsideBracket && item.snoozeCount === 0 && (
                <TouchableOpacity
                    style={[styles.snoozeButton, { borderColor: colors.secondary, flex: 1 }]}
                    onPress={() => handleSnooze(item.id)}
                >
                    <Text style={[styles.snoozeText, { color: colors.secondary }]}>SNOOZE</Text>
                </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (missions.length === 0 && !allCompleted) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Lvl {userStats.level}</Text>
            <Text style={[styles.streakInfo, { color: colors.streak }]}>🔥 {userStats.streak} Day Streak</Text>
          </View>
          <TouchableOpacity
            style={[styles.flexToggle, { borderColor: colors.border }, flexMode && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setFlexMode(!flexMode)}
          >
            <Text style={[styles.flexText, { color: colors.subtext }, flexMode && { color: '#fff' }]}>
              {flexMode ? 'FLEX ON' : 'FLEX OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.xpBarContainer, { backgroundColor: colors.xpBar }]}>
          <View style={[styles.xpBar, { backgroundColor: colors.xpBarFill, width: `${(userStats.xp % 100)}%` }]} />
        </View>

        {/* Movement Simulation Debug UI */}
        <View style={styles.debugRow}>
            <TouchableOpacity onPress={toggleMovement} style={[styles.debugBtn, { backgroundColor: movementState === 'STILL' ? '#e74c3c' : '#2ecc71' }]}>
                <Text style={styles.debugBtnText}>{movementState === 'STILL' ? 'Simulate Moving' : 'Simulate Still'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={mockLongStationary} style={[styles.debugBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.debugBtnText}>Simulate 45m Still</Text>
            </TouchableOpacity>
        </View>
      </View>

      {allCompleted && (
        <View style={[styles.completionBanner, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.completionText, { color: colors.success }]}>
            Well done for completing today's exercises! 🎉
          </Text>
        </View>
      )}

      <FlatList
        data={missions}
        renderItem={renderMission}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refreshData}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  streakInfo: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  xpBarContainer: {
    height: 6,
    borderRadius: 3,
    marginTop: 15,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
  },
  flexToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  flexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bracket: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  doneBadge: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  completeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  snoozeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  snoozeText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  completionBanner: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  debugRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      gap: 10,
  },
  debugBtn: {
      flex: 1,
      padding: 8,
      borderRadius: 10,
      alignItems: 'center',
  },
  debugBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  }
});
