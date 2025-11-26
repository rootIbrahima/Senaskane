import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';

export const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de l'image
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de la barre de progression
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    // Naviguer vers Login après 5 secondes
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[COLORS.primary, '#1565C0', '#0D47A1']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Cercles décoratifs en arrière-plan */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Contenu principal */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/splash.jpg')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Nom de l'application */}
        <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>SENASKANE</Text>
          <Text style={styles.subtitle}>Votre arbre généalogique familial</Text>
        </Animated.View>

        {/* Barre de progression moderne */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>

      {/* Footer */}
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // Cercles décoratifs en arrière-plan
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '40%',
    right: -30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    zIndex: 1,
  },
  imageContainer: {
    marginBottom: SPACING.xxl,
  },
  imageWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  image: {
    width: 150,
    height: 150,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.md,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
