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
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { missions, userStats, allCompleted, refreshData, updateMissionStatus, setUserStats, setAllCompleted } = useData();
  const [flexMode, setFlexMode] = useState(false);
  const [movementState, setMovementState] = useState(movementService.getMovementState());
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    refreshData();
    healthService.getTodayTotalSteps().then(setTotalSteps);

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
              text2: `You've been stationary for ${movementService.getStationaryMinutes()}m. Time for ${mission.exerciseId.replace('-', ' ')}! 💪`,
              visibilityTime: 10000,
            });
          }
        }
      });
    };

    const interval = setInterval(checkRequiredMissions, Config.CHECK_MISSIONS_INTERVAL);
    return () => clearInterval(interval);
  }, []); // Run on mount only

  useEffect(() => {
      const runCatchup = async () => {
          if (missions.length === 0) return;

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
                      Toast.show({
                          type: 'success',
                          text1: 'Auto-Validated! 💪',
                          text2: `Goal met: ${tierNeeded} steps!`,
                      });
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
              text2: 'One more challenge for today! 🎯',
          });
      } catch (error: any) {
          const msg = error.response?.data?.error || 'Failed to get extra credit mission';
          Toast.show({ type: 'error', text1: 'Not Ready', text2: msg });
      }
  };

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
      movementService.setMockStationarySince(Config.STATIONARY_THRESHOLD_MINUTES + Config.MOCK_STATIONARY_ADDITIONAL_MINUTES);
      setMovementState('STILL');
      Toast.show({
          type: 'success',
          text1: 'Time Warp!',
          text2: `Simulated ${Config.STATIONARY_THRESHOLD_MINUTES + Config.MOCK_STATIONARY_ADDITIONAL_MINUTES} minutes of being still.`,
      });
  };

  const simulateHike = async () => {
    healthService.setMockSteps(Config.DAILY_STEP_GOAL);
    await refreshData();
    Toast.show({
        type: 'success',
        text1: 'Hike Simulated!',
        text2: `Goal met: ${Config.DAILY_STEP_GOAL} steps!`,
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
                <Text style={styles.refreshIcon}>🔄</Text>
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
            <TouchableOpacity onPress={simulateHike} style={[styles.debugBtn, { backgroundColor: '#9b59b6' }]}>
                <Text style={styles.debugBtnText}>Simulate Hike</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statusBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
              👟 <Text style={styles.statusTextBold}>{totalSteps}</Text> steps today
          </Text>
          {totalSteps >= Config.DAILY_STEP_GOAL ? (
              <Text style={[styles.goalReached, { color: colors.success }]}>Daily goal reached! 🏆</Text>
          ) : (
              <Text style={[styles.statusSubtext, { color: colors.subtext }]}>
                  {Config.DAILY_STEP_GOAL - totalSteps} steps to auto-complete all missions
              </Text>
          )}
      </View>

      {allCompleted && !missions.some(m => m.id.startsWith('bonus-')) && (
        <View style={styles.completionContainer}>
            <View style={[styles.completionBanner, styles.completionBannerSuccess]}>
                <Text style={[styles.completionText, { color: colors.success }]}>
                    {totalSteps >= Config.DAILY_STEP_GOAL ?
                        `You completed ${totalSteps} steps today - all missions completed! Well done! 🎉` :
                        "Well done for completing today's exercises! 🎉"}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.bonusBtn, { backgroundColor: colors.primary }]}
                onPress={handleBonusMission}
            >
                <Text style={styles.bonusBtnText}>+ Extra Credit?</Text>
            </TouchableOpacity>
        </View>
      )}

      {allCompleted && missions.some(m => m.id.startsWith('bonus-')) && missions.find(m => m.id.startsWith('bonus-'))?.status === 'COMPLETED' && (
        <View style={styles.completionContainer}>
            <View style={[styles.completionBanner, styles.completionBannerSuccess]}>
                <Text style={[styles.completionText, { color: colors.success }]}>
                    Today's quest is complete, including Extra Credit! 🏆 See you tomorrow!
                </Text>
            </View>
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

