import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [codeAcces, setCodeAcces] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    loadCodeAcces();
  }, []);

  const loadCodeAcces = async () => {
    try {
      setLoadingCode(true);
      const data = await authApi.getMyCode();
      setCodeAcces(data.code);
    } catch (error) {
      console.error('Erreur chargement code:', error);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (codeAcces) {
      await Clipboard.setStringAsync(codeAcces);
      if (Platform.OS === 'web') {
        alert('Code copié dans le presse-papiers !');
      } else {
        Alert.alert('Succès', 'Code copié dans le presse-papiers !');
      }
    }
  };

  const handleShareCode = async () => {
    if (!codeAcces) return;

    const message = `Rejoignez notre arbre généalogique familial Baïla Généa !\n\nCode d'accès : ${codeAcces}\n\nTéléchargez l'application et utilisez ce code pour vous connecter.`;

    try {
      if (Platform.OS === 'web') {
        await navigator.share({
          title: 'Code d\'accès famille',
          text: message,
        }).catch(() => {
          // Fallback to copy if share not available
          handleCopyCode();
        });
      } else {
        await Share.share({
          message: message,
          title: 'Code d\'accès famille Baïla Généa',
        });
      }
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
        logout();
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Voulez-vous vraiment vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', onPress: logout, style: 'destructive' },
        ]
      );
    }
  };

  const menuItems = [
    { id: 'famille', title: 'Informations de la famille', icon: 'home', screen: 'FamilleInfo' },
    { id: 'password', title: 'Changer le mot de passe', icon: 'key', screen: 'ChangePassword' },
    { id: 'about', title: 'À propos', icon: 'information-circle', screen: 'About' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
        <Text style={styles.userLogin}>@{user?.login}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
          </Text>
        </View>
      </Card>

      {/* Code d'accès famille */}
      <Card style={styles.codeCard}>
        <View style={styles.codeHeader}>
          <Ionicons name="key" size={24} color={COLORS.primary} />
          <Text style={styles.codeTitle}>Code d'accès famille</Text>
        </View>
        <Text style={styles.codeSubtitle}>
          Partagez ce code avec votre famille pour qu'ils puissent accéder à l'arbre généalogique
        </Text>

        {loadingCode ? (
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>Chargement...</Text>
          </View>
        ) : codeAcces ? (
          <>
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{codeAcces}</Text>
            </View>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeButton} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={20} color={COLORS.white} />
                <Text style={styles.codeButtonText}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeButton} onPress={handleShareCode}>
                <Ionicons name="share-outline" size={20} color={COLORS.white} />
                <Text style={styles.codeButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.codeDisplay}>
            <Text style={styles.codeError}>Erreur de chargement</Text>
          </View>
        )}
      </Card>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color={COLORS.primary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  userCard: { alignItems: 'center', padding: SPACING.lg, marginBottom: SPACING.md },
  avatarContainer: { marginBottom: SPACING.md },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.white },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs },
  userLogin: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  roleBadge: {
    backgroundColor: COLORS.primary + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  roleText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  codeCard: { padding: SPACING.md, marginBottom: SPACING.md },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  codeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  codeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  codeDisplay: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  codeError: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  codeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  menuSection: { marginBottom: SPACING.md },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginLeft: SPACING.md, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error,
  },
  logoutText: { fontSize: FONT_SIZES.md, color: COLORS.error, marginLeft: SPACING.sm, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.lg },
});
