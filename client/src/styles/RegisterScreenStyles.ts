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
  socialSection: { marginTop: 40, gap: 15 },
  divider: { height: 1, width: '100%', position: 'absolute', top: 10 },
  orText: { alignSelf: 'center', paddingHorizontal: 10, fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  socialBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  socialBtnGoogle: { backgroundColor: '#db4437' },
  socialBtnFacebook: { backgroundColor: '#4267B2' },
  socialBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
