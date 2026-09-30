import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  missedCard: {
    borderColor: '#e74c3c',
    borderWidth: 1,
    opacity: 0.7,
  },
  missedText: {
    color: '#e74c3c',
  },
  missedExerciseName: {
    textDecorationLine: 'line-through',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  completionBannerSuccess: {
    backgroundColor: '#2ecc7120',
  },
  completionText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  missedAlert: {
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 4,
      marginBottom: 8,
  },
  statusBanner: {
      padding: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  statusText: {
      fontSize: 16,
  },
  statusTextBold: {
      fontWeight: 'bold',
  },
  statusSubtext: {
      fontSize: 12,
  },
  goalReached: {
      fontSize: 14,
      fontWeight: 'bold',
  },
  completionContainer: {
      margin: 16,
      gap: 12,
  },
  bonusBtn: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  bonusBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
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
