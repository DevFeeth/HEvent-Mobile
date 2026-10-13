import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#001A3D', '#1E3A5F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        <Text style={styles.welcomeTitle}>Bienvenue [NOM]</Text>
        <Text style={styles.welcomeText}>
          Découvrez les événements les plus proches et préparez votre prochaine sortie.
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Prochainement</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
  },
  welcomeCard: {
    marginTop: 16,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    // Ombre iOS
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // Ombre Android
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#C9D3E3',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1F3A',
    marginTop: 28,
    marginBottom: 16,
    },
});