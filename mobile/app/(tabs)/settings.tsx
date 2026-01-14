import React, { useRef, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/header';
import { AnimatedModal } from '@/components/animated-modal';
import Snackbar, { SnackbarRef } from '@/components/ui/snackbar';
import { authClient } from '@/lib/auth-client';
import { Ionicons } from '@expo/vector-icons';
import { usePasskeys, useApiKeys, useCreatePasskey, useCreateApiKey, useDeletePasskey, useDeleteApiKey } from '@/hooks/use-credentials';

type ModalType = 'passkeys' | 'apikeys' | 'about' | 'help' | null;

export default function SettingsScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [passkeyName, setPasskeyName] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');

  const { isPending: isLoadingSession } = authClient.useSession();
  
  // Credentials hooks
  const { data: passkeys, isLoading: isLoadingPasskeys } = usePasskeys();
  const { data: apiKeys, isLoading: isLoadingApiKeys } = useApiKeys();
  const createPasskeyMutation = useCreatePasskey();
  const createApiKeyMutation = useCreateApiKey();
  const deletePasskeyMutation = useDeletePasskey();
  const deleteApiKeyMutation = useDeleteApiKey();

  const handleCreatePasskey = async () => {
    if (!passkeyName.trim()) {
      snackbarRef.current?.show('Please enter a passkey name', 3000);
      return;
    }

    try {
      await createPasskeyMutation.mutateAsync(passkeyName);
      snackbarRef.current?.show('Passkey created successfully', 3000);
      setPasskeyName('');
      setActiveModal(null);
    } catch {
      snackbarRef.current?.show('Failed to create passkey', 3000);
    }
  };

  const handleCreateApiKey = async () => {
    if (!apiKeyName.trim()) {
      snackbarRef.current?.show('Please enter an API key name', 3000);
      return;
    }

    try {
      const result = await createApiKeyMutation.mutateAsync(apiKeyName);
      snackbarRef.current?.show('API key created successfully', 3000);
      setApiKeyName('');
      Alert.alert(
        'API Key Created',
        `Your API key: ${result.key}\n\nPlease copy it now as it won't be shown again.`,
        [{ text: 'OK', onPress: () => setActiveModal(null) }]
      );
    } catch {
      snackbarRef.current?.show('Failed to create API key', 3000);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      await deletePasskeyMutation.mutateAsync(id);
      snackbarRef.current?.show('Passkey deleted', 3000);
    } catch {
      snackbarRef.current?.show('Failed to delete passkey', 3000);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await deleteApiKeyMutation.mutateAsync(id);
      snackbarRef.current?.show('API key deleted', 3000);
    } catch {
      snackbarRef.current?.show('Failed to delete API key', 3000);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.replace('/(auth)');
    } catch (error: any) {
      snackbarRef.current?.show(error?.message || 'Failed to logout', 3000);
      setIsLoggingOut(false);
    }
  };

  if (isLoadingSession) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header title="Settings" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <View className="mt-2">
          <Text className="text-xs font-semibold text-gray-500 px-4 mb-3 uppercase">Security</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModal('passkeys')} className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
                  <Ionicons name="finger-print" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">Passkeys</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {isLoadingPasskeys ? 'Loading...' : `${passkeys?.length || 0} passkey${(passkeys?.length || 0) !== 1 ? 's' : ''} registered`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModal('apikeys')} className="flex-row items-center justify-between py-4 px-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-purple-100 items-center justify-center">
                  <Ionicons name="key" size={20} color="#A855F7" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">API Keys</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {isLoadingApiKeys ? 'Loading...' : `${apiKeys?.length || 0} key${(apiKeys?.length || 0) !== 1 ? 's' : ''} created`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View className="mt-4">
          <Text className="text-xs font-semibold text-gray-500 px-4 mb-3 uppercase">App</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModal('about')} className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center">
                  <Ionicons name="information-circle" size={20} color="#22C55E" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">About</Text>
                  <Text className="text-sm text-gray-600 mt-1">Version 1.0.0</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModal('help')} className="flex-row items-center justify-between py-4 px-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-orange-100 items-center justify-center">
                  <Ionicons name="help-circle" size={20} color="#F97316" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900">Help & Support</Text>
                  <Text className="text-sm text-gray-600 mt-1">Contact us</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-6 gap-3">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
            className="bg-red-500 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Snackbar ref={snackbarRef} />

      {/* Passkeys Modal */}
      <AnimatedModal visible={activeModal === 'passkeys'} onClose={() => setActiveModal(null)}>
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Passkeys</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">Passkeys provide a secure, passwordless way to sign in to your account.</Text>
          
          {isLoadingPasskeys ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <>
              {passkeys && passkeys.length > 0 ? (
                <View className="gap-2">
                  {passkeys.map((passkey) => (
                    <View key={passkey.id} className="bg-gray-100 p-4 rounded-xl flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">{passkey.name}</Text>
                        <Text className="text-gray-600 text-xs mt-1">
                          Created {new Date(passkey.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDeletePasskey(passkey.id)}
                        disabled={deletePasskeyMutation.isPending}
                        className="ml-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-gray-100 p-4 rounded-xl">
                  <Text className="text-gray-600 text-center">No passkeys registered yet</Text>
                </View>
              )}
            </>
          )}
          
          <View className="gap-3">
            <TextInput
              value={passkeyName}
              onChangeText={setPasskeyName}
              placeholder="Passkey name (e.g., My iPhone)"
              className="bg-gray-100 px-4 py-3 rounded-xl text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={handleCreatePasskey}
              disabled={createPasskeyMutation.isPending}
              className="bg-blue-500 py-3 rounded-2xl items-center"
            >
              {createPasskeyMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Add Passkey</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      {/* API Keys Modal */}
      <AnimatedModal visible={activeModal === 'apikeys'} onClose={() => setActiveModal(null)}>
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">API Keys</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">API Keys allow you to access the Fridge API programmatically.</Text>
          
          {isLoadingApiKeys ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#A855F7" />
            </View>
          ) : (
            <>
              {apiKeys && apiKeys.length > 0 ? (
                <View className="gap-2">
                  {apiKeys.map((apiKey) => (
                    <View key={apiKey.id} className="bg-gray-100 p-4 rounded-xl flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold">{apiKey.name}</Text>
                        <Text className="text-gray-600 text-xs mt-1">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.expiresAt && ` • Expires ${new Date(apiKey.expiresAt).toLocaleDateString()}`}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDeleteApiKey(apiKey.id)}
                        disabled={deleteApiKeyMutation.isPending}
                        className="ml-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-gray-100 p-4 rounded-xl">
                  <Text className="text-gray-600 text-center">No API keys created yet</Text>
                </View>
              )}
            </>
          )}
          
          <View className="gap-3">
            <TextInput
              value={apiKeyName}
              onChangeText={setApiKeyName}
              placeholder="API key name (e.g., Mobile App)"
              className="bg-gray-100 px-4 py-3 rounded-xl text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={handleCreateApiKey}
              disabled={createApiKeyMutation.isPending}
              className="bg-purple-500 py-3 rounded-2xl items-center"
            >
              {createApiKeyMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Create API Key</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      {/* About Modal */}
      <AnimatedModal visible={activeModal === 'about'} onClose={() => setActiveModal(null)}>
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">About</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="bg-green-50 p-4 rounded-xl gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700 font-medium">App Name</Text>
              <Text className="text-gray-900 font-semibold">Fridge Companion</Text>
            </View>
            <View className="h-px bg-green-200" />
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700 font-medium">Version</Text>
              <Text className="text-gray-900 font-semibold">1.0.0</Text>
            </View>
            <View className="h-px bg-green-200" />
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700 font-medium">Build</Text>
              <Text className="text-gray-900 font-semibold">001</Text>
            </View>
          </View>
        </View>
      </AnimatedModal>

      {/* Help Modal */}
      <AnimatedModal visible={activeModal === 'help'} onClose={() => setActiveModal(null)}>
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Help & Support</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            <View className="bg-orange-50 p-4 rounded-xl gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail" size={18} color="#F97316" />
                <Text className="text-gray-700 font-medium">Email Support</Text>
              </View>
              <Text className="text-gray-600 text-sm ml-7">support@fridgecompanion.com</Text>
            </View>
            <View className="bg-orange-50 p-4 rounded-xl gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="help-circle" size={18} color="#F97316" />
                <Text className="text-gray-700 font-medium">FAQ</Text>
              </View>
              <Text className="text-gray-600 text-sm ml-7">Visit our help center for common questions</Text>
            </View>
          </View>
        </View>
      </AnimatedModal>
    </SafeAreaView>
  );
}
