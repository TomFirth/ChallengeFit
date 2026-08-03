import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  form: { gap: 15 },
  input: { height: 55, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1 },
  registerBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { textAlign: 'center', marginTop: 15, fontWeight: '600' },
});
