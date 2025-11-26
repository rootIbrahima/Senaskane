import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Loading } from '../components';
import { bandePassanteApi } from '../api/bandePassanteApi';
import { COLORS, SPACING, FONT_SIZES } from '../utils/config';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export const ActualitesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await bandePassanteApi.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderMessage = ({ item }) => (
    <Card style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <Ionicons name="newspaper" size={20} color={COLORS.primary} />
        <Text style={styles.messageDate}>{item.date_publication}</Text>
      </View>
      {item.titre && <Text style={styles.messageTitre}>{item.titre}</Text>}
      <Text style={styles.messageContenu}>{item.contenu}</Text>
    </Card>
  );

  if (loading) return <Loading text="Chargement des actualités..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadMessages} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucune actualité</Text>
          </View>
        }
      />
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AjouterActualite')}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  messageCard: { marginBottom: SPACING.md },
  messageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  messageDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginLeft: SPACING.sm },
  messageTitre: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  messageContenu: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.md },
  fab: {
    position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, width: 60, height: 60,
    borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
});
