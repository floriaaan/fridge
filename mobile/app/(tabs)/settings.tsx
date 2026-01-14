import { Text, View, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { authClient } from '@/lib/auth-client';
import React from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newApiKeyName, setNewApiKeyName] = React.useState('');
  const [newPasskeyName, setNewPasskeyName] = React.useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => authClient.getUser(),
  });

  const { data: passkeys } = useQuery({
    queryKey: ['passkeys'],
    queryFn: () => authClient.passkey.listPasskeys(),
  });

  const { data: apiKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => authClient.apiKey.list(),
  });

  const addPasskeyMutation = useMutation({
    mutationFn: (name: string) => authClient.passkey.addPasskey({ name }),
    onSuccess: () => {
      Alert.alert('Success', 'Passkey added successfully.');
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });
      setNewPasskeyName('');
    },
    onError: (error) => Alert.alert('Error', error.message),
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (name: string) => authClient.apiKey.create({ name }),
    onSuccess: (data) => {
      Alert.alert('API Key Created', `Your new key is: ${data.key}\n\nPlease save it securely. You will not be able to see it again.`);
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setNewApiKeyName('');
    },
    onError: (error) => Alert.alert('Error', error.message),
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (id: string) => authClient.apiKey.delete({ id }),
    onSuccess: () => {
      Alert.alert('Success', 'API Key deleted.');
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => Alert.alert('Error', error.message),
  });

  const handleLogout = async () => {
    await authClient.logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <View style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Account</Text>
          <Text>Email: {user?.email ?? 'Loading...'}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Authentication Methods</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Passkey Name"
              value={newPasskeyName}
              onChangeText={setNewPasskeyName}
            />
            <Button title="Add Passkey" onPress={() => addPasskeyMutation.mutate(newPasskeyName)} />
          </View>
          <FlatList
            data={passkeys}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text>{item.name}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.placeholder}>No passkeys registered.</Text>}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>API Keys</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New API Key Name"
              value={newApiKeyName}
              onChangeText={setNewApiKeyName}
            />
            <Button title="Create" onPress={() => createApiKeyMutation.mutate(newApiKeyName)} />
          </View>
          <FlatList
            data={apiKeys}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text>{item.name}</Text>
                <Button title="Delete" onPress={() => deleteApiKeyMutation.mutate(item.id)} style={styles.deleteButton} />
              </View>
            )}
            ListEmptyComponent={<Text style={styles.placeholder}>No API keys created.</Text>}
          />
        </Card>

        <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  content: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  placeholder: { color: '#666', marginTop: 8 },
  logoutButton: { marginTop: 24, backgroundColor: '#ff3b30' },
  deleteButton: { backgroundColor: '#ff3b30', paddingHorizontal: 12, paddingVertical: 6 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
});
