import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';

export const AboutScreen = () => {
  const features = [
    {
      icon: 'people',
      title: 'Gestion des membres',
      description: 'Ajoutez et gérez les membres de votre famille',
    },
    {
      icon: 'git-network',
      title: 'Arbre généalogique',
      description: 'Visualisez votre arbre généalogique interactif',
    },
    {
      icon: 'calendar',
      title: 'Cérémonies',
      description: 'Organisez et suivez les événements familiaux',
    },
    {
      icon: 'images',
      title: 'Musée familial',
      description: 'Conservez les photos et souvenirs de famille',
    },
    {
      icon: 'search',
      title: 'Recherche avancée',
      description: 'Trouvez rapidement n\'importe quel membre',
    },
    {
      icon: 'shield-checkmark',
      title: 'Sécurisé',
      description: 'Vos données familiales sont protégées',
    },
  ];

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Erreur ouverture lien:', err));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Baïla Généa</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            Votre arbre généalogique familial
          </Text>
        </View>

        <Card style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            Baïla Généa est une application de gestion d'arbre généalogique qui vous permet de
            conserver et partager l'histoire de votre famille. Créez votre arbre, ajoutez des
            membres, organisez des cérémonies et préservez vos souvenirs familiaux.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Fonctionnalités</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon} size={30} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact & Support</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => handleOpenLink('mailto:support@bailagenea.com')}
          >
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>support@bailagenea.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => handleOpenLink('https://bailagenea.com')}
          >
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>www.bailagenea.com</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Baïla Généa. Tous droits réservés.
          </Text>
          <Text style={styles.footerSubtext}>
            Fait avec ❤️ pour préserver vos histoires familiales
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  descriptionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featuresGrid: {
    marginBottom: SPACING.lg,
  },
  featureCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 2,
  },
  contactCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  contactTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  contactText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
