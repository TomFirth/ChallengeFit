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
  settingRowBorder: {
    borderBottomWidth: 1,
  },
  settingRowTopBorder: {
    borderTopWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 14,
  },
  shareIcon: {
    fontSize: 18,
  },
  boldText: {
    fontWeight: 'bold',
  },
  whiteBoldText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
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
