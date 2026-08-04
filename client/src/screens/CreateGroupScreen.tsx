import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../styles/CreateGroupScreenStyles';
import { socialApi } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import Toast from 'react-native-toast-message';

export default function CreateGroupScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await socialApi.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load friends' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (id: string) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter(fid => fid !== id));
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a group name' });
      return;
    }
    if (selectedFriends.length === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select at least one friend' });
      return;
    }

    setCreating(true);
    try {
      await socialApi.createGroup(groupName, selectedFriends);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Group created!' });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating group:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create group' });
    } finally {
      setCreating(false);
    }
  };

  const renderFriendItem = ({ item }: { item: any }) => {
    const isSelected = selectedFriends.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border }]}
        onPress={() => toggleFriend(item.id)}
      >
        <Text style={[styles.friendName, { color: colors.text }]}>{item.username}</Text>
        <View style={[styles.radio, { borderColor: colors.primary, backgroundColor: isSelected ? colors.primary : 'transparent' }]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Group</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.subtext }]}>Group Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Squad Goals"
          placeholderTextColor={colors.subtext}
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={[styles.label, styles.labelMargin, { color: colors.subtext }]}>Select Contacts</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: colors.primary }]}
        onPress={handleCreateGroup}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createBtnText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

