import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {format, startOfWeek, endOfWeek} from 'date-fns';

const WeekScreen: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    const startOfWeekDate = startOfWeek(new Date(), {weekStartsOn: 1}); // Monday as the start of the week
    const endOfWeekDate = endOfWeek(startOfWeekDate, {weekStartsOn: 1});
    setStartDate(startOfWeekDate);
    setEndDate(endOfWeekDate);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][
      day % 10 > 3 ? 0 : (day % 100) - (day % 10) !== 10 ? day % 10 : 0
    ];
    return `${day}${suffix}`;
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Week</Text>
      <Text style={styles.dateRange}>
        {`${formatDate(startDate)} - ${formatDate(endDate)} ${format(
          startDate,
          'MMMM',
        )}`}
      </Text>
      <ScrollView horizontal contentContainerStyle={styles.weekContainer}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity key={index} style={styles.dayButton}>
            <Text style={styles.dayButtonText}>{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  dayButton: {
    padding: 15,
    backgroundColor: '#ddd',
    margin: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 18,
  },
  dateRange: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default WeekScreen;
