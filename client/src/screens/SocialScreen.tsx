import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from '../styles/SocialScreenStyles';
import { socialApi } from '../services/api';
import { useTheme } from '../hooks/useTheme';

export default function SocialScreen() {
  const { colors } = useTheme();
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await socialApi.getFeed();
      setFeed(data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const renderEvent = ({ item }: { item: any }) => {
    const isMilestone = item.type === 'STREAK_MILESTONE';

    return (
      <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.username[0]}</Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={[styles.eventText, { color: colors.text }]}>
            <Text style={styles.username}>{item.username}</Text>
            {isMilestone
              ? ` reached a ${item.data.streak} day streak! 🔥`
              : ` completed ${item.data.exercise}! 💪`}
          </Text>
          <Text style={[styles.time, { color: colors.subtext }]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Friend Feed</Text>
      </View>
      <FlatList
        data={feed}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

