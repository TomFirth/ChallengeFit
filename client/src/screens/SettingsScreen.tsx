import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Platform, Modal, Share } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { missionApi } from '../services/api';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { refreshData } = useData();

  // Availability state
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(18, 0, 0, 0)));
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSaveAvailability = async () => {
    try {
      await missionApi.updateAvailability(formatTime(startTime), formatTime(endTime));
      await refreshData();
      setShowModal(false);
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Availability saved and missions rescheduled!',
      });
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update availability.',
      });
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Join me on Fitness Quest and start your gamified exercise journey! 🎯\nDownload it here: https://fitnessquest.app/download',
        title: 'Fitness Quest',
      });
    } catch (e) {
      console.error('Error sharing app:', e);
    }
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); // Immediate close on Android, valid for iOS too
    if (selectedDate) {
      if (pickerMode === 'start') setStartTime(selectedDate);
      else setEndTime(selectedDate);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Appearance</Text>
        <View style={[styles.settingRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderTopColor: colors.border, borderTopWidth: 1, borderBottomWidth: 1 }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Account</Text>
        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={[styles.settingText, { color: colors.text }]}>Profile Availability</Text>
          <Text style={{ color: colors.subtext }}>{formatTime(startTime)} - {formatTime(endTime)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Spread the Word</Text>
        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1 }]}
          onPress={handleShareApp}
        >
          <Text style={[styles.settingText, { color: colors.text }]}>Share Fitness Quest</Text>
          <Text style={{ fontSize: 18 }}>📤</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Availability</Text>

            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => { setPickerMode('start'); setShowPicker(true); }}
            >
              <Text style={{ color: colors.text }}>Start Time</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeRow}
              onPress={() => { setPickerMode('end'); setShowPicker(true); }}
            >
              <Text style={{ color: colors.text }}>End Time</Text>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{formatTime(endTime)}</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={pickerMode === 'start' ? startTime : endTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onPickerChange}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.subtext }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAvailability} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save & Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={{ color: colors.subtext, fontSize: 12 }}>Fitness Quest v1.0.1</Text>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 15,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  settingText: {
    fontSize: 16,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelBtn: {
    padding: 12,
  },
  saveBtn: {
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  }
});
