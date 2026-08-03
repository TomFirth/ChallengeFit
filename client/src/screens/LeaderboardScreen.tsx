import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { styles } from '../styles/LeaderboardScreenStyles';
import { socialApi } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import Toast from 'react-native-toast-message';

export default function LeaderboardScreen({ navigation }: any) {
  const { isDarkMode, colors } = useTheme();
  const { userStats } = useData();
  const [data, setData] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaderboard, groupsData] = await Promise.all([
        selectedGroupId ? socialApi.getGroupLeaderboard(selectedGroupId) : socialApi.getLeaderboard(),
        socialApi.getGroups()
      ]);
      setData(leaderboard);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroupId]);

  const handleShare = async () => {
    if (!selectedGroupId) return;

    const groupName = groups.find(g => g.id === selectedGroupId)?.name || 'Squad';
    const myRank = data.findIndex(item => item.id === 'u1') + 1;
    const myXP = data.find(item => item.id === 'u1')?.xp || 0;

    let message = `Check out our ${groupName} leaderboard on Fitness Quest! 🏆\n\n`;
    if (myRank > 0) {
      message += `I'm currently #${myRank} with ${myXP} XP! 💪`;
    } else {
      message += `Join us and start your fitness quest!`;
    }

    try {
      await Share.share({
        message,
        title: `${groupName} Leaderboard`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.id === 'u1';

    return (
      <View style={[styles.row, { backgroundColor: colors.card }, isMe && { borderColor: '#f1c40f', borderWidth: 2, backgroundColor: isDarkMode ? '#2c2c00' : '#fffdf0' }]}>
        <Text style={[styles.rank, { color: colors.subtext }]}>{index + 1}</Text>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{item.username} {isMe && '(You)'}</Text>
          <Text style={[styles.stats, { color: colors.subtext }]}>Lvl {item.level} • {item.streak} day streak</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.xp, { color: colors.secondary }]}>{item.xp} XP</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#f1c40f" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>
            {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : 'Global Ranks'}
          </Text>
          <View style={styles.headerButtons}>
            {selectedGroupId && (
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                onPress={handleShare}
              >
                <Text style={[styles.shareBtnText, { color: colors.text }]}>📤 Share</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.createBtnText}>+ Group</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'Global' }, ...groups]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.groupTab,
                {
                  backgroundColor: selectedGroupId === item.id ? colors.primary : colors.background,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setSelectedGroupId(item.id)}
            >
              <Text style={{ color: selectedGroupId === item.id ? '#fff' : colors.text, fontWeight: 'bold' }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id || 'global'}
          style={styles.groupsList}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

