import React, { useRef, useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/ui/header";
import { AnimatedModal } from "@/components/animated-modal";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { authClient, reinitializeAuthClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import {
  usePasskeys,
  useApiKeys,
  useCreatePasskey,
  useCreateApiKey,
  useDeletePasskey,
  useDeleteApiKey,
} from "@/hooks/use-credentials";
import { useTranslation } from "@/hooks/use-translation";
import {
  getServerConfig,
  setServerConfig,
  setOnboardingCompleted,
  type ServerConfig,
} from "@/lib/server-config";
import { updateCachedConfig } from "@/lib/api-config";

type ModalType = "passkeys" | "apikeys" | "about" | "help" | "server" | null;

export default function SettingsScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [passkeyName, setPasskeyName] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Server configuration state
  const [serverConfig, setServerConfigState] = useState<ServerConfig | null>(null);
  const [newServerUrl, setNewServerUrl] = useState("");
  const [isSavingServer, setIsSavingServer] = useState(false);

  const { isPending: isLoadingSession } = authClient.useSession();

  // Load server configuration on mount
  useEffect(() => {
    const loadServerConfig = async () => {
      const config = await getServerConfig();
      setServerConfigState(config);
      if (config) {
        setNewServerUrl(config.baseUrl);
      }
    };
    loadServerConfig();
  }, []);

  const handleSaveServerConfig = async () => {
    if (!newServerUrl.trim()) {
      snackbarRef.current?.show(t("onboarding.enterUrl"), 3000);
      return;
    }

    try {
      new URL(newServerUrl);
    } catch {
      snackbarRef.current?.show(t("onboarding.invalidUrl"), 3000);
      return;
    }

    setIsSavingServer(true);
    try {
      const config: ServerConfig = {
        baseUrl: newServerUrl.trim(),
        isOfficialInstance: false,
      };

      await setServerConfig(config);
      await setOnboardingCompleted(true);
      
      // Update cached config and reinitialize auth client
      updateCachedConfig(config);
      reinitializeAuthClient();
      
      setServerConfigState(config);
      snackbarRef.current?.show(t("onboarding.configSaved"), 2000);
      setActiveModal(null);
    } catch (error) {
      console.error("Error saving server config:", error);
      snackbarRef.current?.show(t("onboarding.saveFailed"), 3000);
    } finally {
      setIsSavingServer(false);
    }
  };

export default function SettingsScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [passkeyName, setPasskeyName] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { isPending: isLoadingSession } = authClient.useSession();

  // Credentials hooks
  const { data: passkeys, isLoading: isLoadingPasskeys } = usePasskeys();
  const { data: apiKeys, isLoading: isLoadingApiKeys } = useApiKeys();
  const createPasskeyMutation = useCreatePasskey();
  const createApiKeyMutation = useCreateApiKey();
  const deletePasskeyMutation = useDeletePasskey();
  const deleteApiKeyMutation = useDeleteApiKey();

  const chevronColor = isDark ? "#525252" : "#d4d4d4";
  const iconInactiveColor = isDark ? "#a3a3a3" : "#737373";

  const handleCreatePasskey = async () => {
    if (!passkeyName.trim()) {
      snackbarRef.current?.show("Please enter a passkey name", 3000);
      return;
    }

    try {
      await createPasskeyMutation.mutateAsync(passkeyName);
      snackbarRef.current?.show("Passkey created successfully", 3000);
      setPasskeyName("");
      setActiveModal(null);
    } catch {
      snackbarRef.current?.show("Failed to create passkey", 3000);
    }
  };

  const handleCreateApiKey = async () => {
    if (!apiKeyName.trim()) {
      snackbarRef.current?.show("Please enter an API key name", 3000);
      return;
    }

    try {
      const result = await createApiKeyMutation.mutateAsync(apiKeyName);
      snackbarRef.current?.show("API key created successfully", 3000);
      setApiKeyName("");
      Alert.alert(
        "API Key Created",
        `Your API key: ${result.key}\n\nPlease copy it now as it won't be shown again.`,
        [{ text: "OK", onPress: () => setActiveModal(null) }]
      );
    } catch {
      snackbarRef.current?.show("Failed to create API key", 3000);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      await deletePasskeyMutation.mutateAsync(id);
      snackbarRef.current?.show("Passkey deleted", 3000);
    } catch {
      snackbarRef.current?.show("Failed to delete passkey", 3000);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await deleteApiKeyMutation.mutateAsync(id);
      snackbarRef.current?.show("API key deleted", 3000);
    } catch {
      snackbarRef.current?.show("Failed to delete API key", 3000);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.replace("/(auth)");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("common.failedToLogout");
      snackbarRef.current?.show(errorMessage, 3000);
      setIsLoggingOut(false);
    }
  };

  if (isLoadingSession) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "white" : "black"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <Header title={t("settings.title")} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <View className="mt-2">
          <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-4 mb-3 uppercase">
            {t("settings.security")}
          </Text>

          <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveModal("passkeys")}
              className="flex-row items-center justify-between py-4 px-4 border-b border-neutral-100 dark:border-neutral-700"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 items-center justify-center">
                  <Ionicons name="finger-print" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("settings.passkeys")}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {isLoadingPasskeys
                      ? t("common.loading")
                      : `${passkeys?.length || 0} passkey${(passkeys?.length || 0) !== 1 ? "s" : ""} registered`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveModal("apikeys")}
              className="flex-row items-center justify-between py-4 px-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 items-center justify-center">
                  <Ionicons name="key" size={20} color="#A855F7" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("settings.apiKeys")}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {isLoadingApiKeys
                      ? t("common.loading")
                      : `${apiKeys?.length || 0} key${(apiKeys?.length || 0) !== 1 ? "s" : ""} created`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Server Section */}
        <View className="mt-4">
          <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-4 mb-3 uppercase">
            {t("settings.server")}
          </Text>

          <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveModal("server")}
              className="flex-row items-center justify-between py-4 px-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900 items-center justify-center">
                  <Ionicons name="server" size={20} color="#06B6D4" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("settings.serverConfiguration")}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1" numberOfLines={1}>
                    {serverConfig?.isOfficialInstance
                      ? t("settings.officialInstance")
                      : serverConfig?.baseUrl || t("common.loading")}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View className="mt-4">
          <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-4 mb-3 uppercase">
            {t("settings.app")}
          </Text>

          <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveModal("about")}
              className="flex-row items-center justify-between py-4 px-4 border-b border-neutral-100 dark:border-neutral-700"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 items-center justify-center">
                  <Ionicons name="information-circle" size={20} color="#22C55E" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("settings.about")}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t("settings.version")} 1.0.0
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveModal("help")}
              className="flex-row items-center justify-between py-4 px-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 items-center justify-center">
                  <Ionicons name="help-circle" size={20} color="#F97316" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("settings.helpSupport")}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {t("settings.contactUs")}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={chevronColor} />
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
              {isLoggingOut ? t("common.loading") : t("auth.logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Snackbar ref={snackbarRef} />

      {/* Passkeys Modal */}
      <AnimatedModal
        visible={activeModal === "passkeys"}
        onClose={() => setActiveModal(null)}
      >
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("settings.passkeys")}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={iconInactiveColor} />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-600 dark:text-neutral-400">
            {t("settings.passkeysInfo")}
          </Text>

          {isLoadingPasskeys ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <>
              {passkeys && passkeys.length > 0 ? (
                <View className="gap-2">
                  {passkeys.map((passkey) => (
                    <View
                      key={passkey.id}
                      className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
                          {passkey.name}
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
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
                <View className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl">
                  <Text className="text-neutral-600 dark:text-neutral-400 text-center">
                    {t("settings.noPasskeys")}
                  </Text>
                </View>
              )}
            </>
          )}

          <View className="gap-3">
            <TextInput
              value={passkeyName}
              onChangeText={setPasskeyName}
              placeholder="Passkey name (e.g., My iPhone)"
              className="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-xl text-neutral-900 dark:text-neutral-100"
              placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
            />
            <TouchableOpacity
              onPress={handleCreatePasskey}
              disabled={createPasskeyMutation.isPending}
              className="bg-blue-500 py-3 rounded-2xl items-center"
            >
              {createPasskeyMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {t("settings.addPasskey")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      {/* API Keys Modal */}
      <AnimatedModal
        visible={activeModal === "apikeys"}
        onClose={() => setActiveModal(null)}
      >
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("settings.apiKeys")}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={iconInactiveColor} />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-600 dark:text-neutral-400">
            {t("settings.apiKeysInfo")}
          </Text>

          {isLoadingApiKeys ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#A855F7" />
            </View>
          ) : (
            <>
              {apiKeys && apiKeys.length > 0 ? (
                <View className="gap-2">
                  {apiKeys.map((apiKey) => (
                    <View
                      key={apiKey.id}
                      className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
                          {apiKey.name}
                        </Text>
                        <Text className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.expiresAt &&
                            ` • Expires ${new Date(apiKey.expiresAt).toLocaleDateString()}`}
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
                <View className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl">
                  <Text className="text-neutral-600 dark:text-neutral-400 text-center">
                    {t("settings.noApiKeys")}
                  </Text>
                </View>
              )}
            </>
          )}

          <View className="gap-3">
            <TextInput
              value={apiKeyName}
              onChangeText={setApiKeyName}
              placeholder="API key name (e.g., Mobile App)"
              className="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-xl text-neutral-900 dark:text-neutral-100"
              placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
            />
            <TouchableOpacity
              onPress={handleCreateApiKey}
              disabled={createApiKeyMutation.isPending}
              className="bg-purple-500 py-3 rounded-2xl items-center"
            >
              {createApiKeyMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {t("settings.createApiKey")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>

      {/* About Modal */}
      <AnimatedModal
        visible={activeModal === "about"}
        onClose={() => setActiveModal(null)}
      >
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("settings.about")}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={iconInactiveColor} />
            </TouchableOpacity>
          </View>
          <View className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                {t("settings.appName")}
              </Text>
              <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
                {t("settings.fridgeCompanion")}
              </Text>
            </View>
            <View className="h-px bg-green-200 dark:bg-green-800" />
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                {t("settings.version")}
              </Text>
              <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
                1.0.0
              </Text>
            </View>
            <View className="h-px bg-green-200 dark:bg-green-800" />
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                {t("settings.build")}
              </Text>
              <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">
                001
              </Text>
            </View>
          </View>
        </View>
      </AnimatedModal>

      {/* Help Modal */}
      <AnimatedModal
        visible={activeModal === "help"}
        onClose={() => setActiveModal(null)}
      >
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("settings.helpSupport")}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={iconInactiveColor} />
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            <View className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail" size={18} color="#F97316" />
                <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {t("settings.emailSupport")}
                </Text>
              </View>
              <Text className="text-neutral-600 dark:text-neutral-400 text-sm ml-7">
                support@fridgecompanion.com
              </Text>
            </View>
            <View className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="help-circle" size={18} color="#F97316" />
                <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {t("settings.faq")}
                </Text>
              </View>
              <Text className="text-neutral-600 dark:text-neutral-400 text-sm ml-7">
                {t("settings.faqDescription")}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedModal>

      {/* Server Configuration Modal */}
      <AnimatedModal
        visible={activeModal === "server"}
        onClose={() => setActiveModal(null)}
      >
        <View className="gap-4 pb-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("settings.serverConfiguration")}
            </Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={iconInactiveColor} />
            </TouchableOpacity>
          </View>

          <View className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-xl gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-300 font-medium">
                {t("settings.currentServer")}
              </Text>
              <View className="flex-row items-center gap-2">
                <View
                  className={`w-2 h-2 rounded-full ${
                    serverConfig?.isOfficialInstance ? "bg-blue-500" : "bg-purple-500"
                  }`}
                />
                <Text className="text-neutral-900 dark:text-neutral-100 font-semibold text-sm">
                  {serverConfig?.isOfficialInstance
                    ? t("settings.officialInstance")
                    : t("settings.selfHosted")}
                </Text>
              </View>
            </View>
            <View className="h-px bg-cyan-200 dark:bg-cyan-800" />
            <Text
              className="text-neutral-600 dark:text-neutral-400 text-sm"
              numberOfLines={2}
            >
              {serverConfig?.baseUrl || "-"}
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {t("settings.changeServer")}
            </Text>
            <TextInput
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="https://your-server.com"
              placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              className="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-xl text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
            />
            <TouchableOpacity
              onPress={handleSaveServerConfig}
              disabled={isSavingServer}
              className="bg-cyan-500 py-3 rounded-2xl items-center"
            >
              {isSavingServer ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {t("common.save")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedModal>
    </SafeAreaView>
  );
}
