import React, {useState} from 'react';
import {StyleSheet, Text, View, Button, FlatList} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';

const TodayScreen: React.FC = () => {
  const [intervals, setIntervals] = useState<
    {start: Date | null; end: Date | null}[]
  >([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentInterval, setCurrentInterval] = useState<{
    start: Date | null;
    end: Date | null;
  }>({start: null, end: null});

  const handleAddInterval = () => {
    setShowStartPicker(true);
  };

  const handleStartTimeChange = (
    event: any,
    selectedDate: Date | undefined,
  ) => {
    const currentDate = selectedDate || new Date();
    setShowStartPicker(false);
    setCurrentInterval({start: currentDate, end: null});
    setShowEndPicker(true);
  };

  const handleEndTimeChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowEndPicker(false);
    if (currentInterval.start) {
      setIntervals([
        ...intervals,
        {start: currentInterval.start, end: currentDate},
      ]);
      setCurrentInterval({start: null, end: null});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <FlatList
        data={intervals}
        renderItem={({item}) => (
          <Text>{`${format(item.start!, 'HH:mm')} - ${format(
            item.end!,
            'HH:mm',
          )}`}</Text>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      <Button title="+" onPress={handleAddInterval} />
      {showStartPicker && (
        <DateTimePicker
          value={currentInterval.start || new Date()}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={currentInterval.end || new Date()}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default TodayScreen;
