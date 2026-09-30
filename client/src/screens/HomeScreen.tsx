import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Config } from '../constants/Config';
import { styles } from '../styles/HomeScreenStyles';
import { missionApi } from '../services/api';
import { Mission } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { movementService } from '../services/MovementService';
import { healthService } from '../services/HealthService';
import { pedometerService } from '../services/PedometerService';
import { notificationService } from '../services/NotificationService';
import Toast from 'react-native-toast-message';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { missions, userStats, allCompleted, refreshData, updateMissionStatus, setUserStats, setAllCompleted } = useData();
  const [flexMode, setFlexMode] = useState(false);
  const [movementState, setMovementState] = useState(movementService.getMovementState());
  const [totalSteps, setTotalSteps] = useState(0);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    refreshData();
    notificationService.registerForPushNotificationsAsync();

    const updateHealthStats = async () => {
        const steps = await healthService.getTodayTotalSteps();
        setTotalSteps(steps);
        setCalories(pedometerService.calculateCalories(steps));
    };

    updateHealthStats();

    const unsubscribe = pedometerService.onStepChange(async () => {
        await updateHealthStats();
        movementService.setMovementState('MOVING');
        setTimeout(() => movementService.setMovementState('STILL'), 5000);
    });

    const checkRequiredMissions = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      missions.forEach(mission => {
        const bracketStart = mission.bracket?.start || (mission as any).bracketStart;
        if (mission.status === 'PENDING' && currentTime === bracketStart) {
          if (movementService.isAvailableForMission()) {
            Toast.show({
              type: 'info',
              text1: 'Exercise Required!',
              text2: `You've been stationary for ${movementService.getStationaryMinutes()}m. Time for ${mission.exerciseId.replace('-', ' ')}!`,
              visibilityTime: 10000,
            });
          }
        }
      });
    };

    const interval = setInterval(checkRequiredMissions, Config.CHECK_MISSIONS_INTERVAL);
    return () => {
        clearInterval(interval);
        unsubscribe();
    };
  }, []);

  useEffect(() => {
      const runCatchup = async () => {
          if (missions.length === 0) return;

          // Schedule notifications for pending missions
          await notificationService.cancelAllNotifications();
          missions.forEach(mission => {
              if (mission.status === 'PENDING') {
                  const bracketStart = mission.bracket?.start || (mission as any).bracketStart;
                  notificationService.missionNotification(mission.id, mission.exerciseId, bracketStart);
              }
          });

          const steps = await healthService.getTodayTotalSteps();
          setTotalSteps(steps);

          const tiers = [Config.STEP_THRESHOLD_PER_MISSION, Config.STEP_THRESHOLD_PER_MISSION * 2, Config.DAILY_STEP_GOAL];
          const pendingMissions = missions.filter(m => m.status !== 'COMPLETED').sort((a, b) => {
              const startA = a.bracket?.start || (a as any).bracketStart || '';
              const startB = b.bracket?.start || (b as any).bracketStart || '';
              return startA.localeCompare(startB);
          });
          const completedCount = missions.filter(m => m.status === 'COMPLETED').length;

          for (let i = 0; i < pendingMissions.length; i++) {
              const mission = pendingMissions[i];
              const tierNeeded = tiers[completedCount + i];

              if (steps >= tierNeeded) {
                  try {
                      await missionApi.validateMission(mission.id, Config.STEP_THRESHOLD_PER_MISSION);
                      if (tierNeeded >= Config.DAILY_STEP_GOAL) {
                          Toast.show({
                              type: 'success',
                              text1: 'Goal Reached!',
                              text2: `You completed ${steps} steps today - all missions completed!`,
                          });
                      } else {
                          Toast.show({
                              type: 'success',
                              text1: 'Auto-Validated!',
                              text2: `Goal met: ${tierNeeded} steps!`,
                          });
                      }
                  } catch (e) {
                      console.error('Catch-up validation failed', e);
                  }
              }
          }
          refreshData();
      };

      runCatchup();
  }, [missions]);

  const handleBonusMission = async () => {
      try {
          const response = await missionApi.getBonusMission();
          await refreshData();
          Toast.show({
              type: 'success',
              text1: 'Extra Credit Unlocked!',
              text2: 'One more challenge for today!',
          });
      } catch (error: any) {
          const msg = error.response?.data?.error || 'Failed to get extra credit mission';
          Toast.show({ type: 'error', text1: 'Not Ready', text2: msg });
      }
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
          text1: 'WELL DONE!',
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
      await missionApi.refreshMission(id);
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
        text2: `You have ${Config.SNOOZE_MINUTES} more minutes!`,
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

    // Redemption Logic
    const completedCount = missions.filter(m => m.status === 'COMPLETED').length;
    const tiers = [Config.STEP_THRESHOLD_PER_MISSION, Config.STEP_THRESHOLD_PER_MISSION * 2, Config.DAILY_STEP_GOAL];
    const stepsNeededForThisMission = tiers[index] || (completedCount + 1) * Config.STEP_THRESHOLD_PER_MISSION;
    const remainingSteps = Math.max(0, stepsNeededForThisMission - totalSteps);

    const missedMessage = isMissed
        ? `Any missed goals can be completed with steps. Walk ${remainingSteps} more steps to redeem.`
        : null;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const bracketStart = item.bracket?.start || (item as any).bracketStart;
    const bracketEnd = item.bracket?.end || (item as any).bracketEnd;
    const isInsideBracket = currentTime >= bracketStart && currentTime <= bracketEnd;

    return (
      <View style={[
          styles.card, 
          { backgroundColor: colors.card }, 
          isCompleted && { backgroundColor: colors.background, opacity: 0.8 },
          isMissed && styles.missedCard
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[
              styles.bracket, 
              { color: colors.secondary }, 
              isCompleted && { color: colors.success },
              isMissed && styles.missedText
          ]}>
            {bracketStart} - {bracketEnd}
          </Text>
          <View style={styles.badgeRow}>
            {isCompleted && <Text style={[styles.doneBadge, { color: colors.success }]}>DONE</Text>}
            {isMissed && <Text style={[styles.doneBadge, styles.missedText]}>MISSED</Text>}
            {!isCompleted && !isMissed && (
              <TouchableOpacity onPress={() => handleRefresh(item.id)}>
                <Text style={styles.refreshIcon}>REFRESH</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[
            styles.exerciseName, 
            { color: colors.text }, 
            !isNext && !isCompleted && !isMissed && { color: colors.subtext },
            isMissed && styles.missedExerciseName
        ]}>
          {item.exerciseId.replace('-', ' ').toUpperCase()}
        </Text>

        {missedMessage && (
            <Text style={[styles.missedAlert, { color: '#e74c3c' }]}>{missedMessage}</Text>
        )}

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
            <Text style={[styles.streakInfo, { color: colors.streak }]}>{userStats.streak} Day Streak</Text>
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
      </View>

      <View style={[styles.statusBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.statusText, { color: colors.text }]}>
                <Text style={styles.statusTextBold}>{totalSteps}</Text> steps today
            </Text>
            <Text style={[styles.statusSubtext, { color: colors.subtext }]}>
                {calories} kcal burned
            </Text>
          </View>
          {totalSteps >= Config.DAILY_STEP_GOAL ? (
              <Text style={[styles.goalReached, { color: colors.success }]}>Daily goal reached!</Text>
          ) : (
              <Text style={[styles.statusSubtext, { color: colors.subtext }]}>
                  {Config.DAILY_STEP_GOAL - totalSteps} steps to auto-complete all missions
              </Text>
          )}
      </View>

      {allCompleted && !missions.some(m => m.id.startsWith('bonus-')) && (
        <View style={styles.completionContainer}>
            <TouchableOpacity
                style={[styles.bonusBtn, { backgroundColor: colors.primary }]}
                onPress={handleBonusMission}
            >
                <Text style={styles.bonusBtnText}>+ Extra Credit?</Text>
            </TouchableOpacity>
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
