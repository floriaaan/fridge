import { useState } from "react";
import { View, TextInput, Text, useColorScheme } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

export default function DebugScreen() {
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("password1234");
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    data: session,
    refetch,
    error,
    isPending,
    isRefetching,
  } = authClient.useSession();

  const handleLogin = async () => {
    console.log("Attempting to log in with:", email, password);
    const response = await authClient.signIn.email({
      email,
      password,
    });
    console.log("Login response:", response);
    refetch();
  };

  return (
    <View
      className="flex-1 bg-neutral-50 dark:bg-black"
      style={{ padding: 20, marginTop: 50 }}
    >
      <TextInput
        keyboardType="email-address"
        className="bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl"
        style={{
          marginBottom: 10,
          height: 40,
          paddingHorizontal: 10,
        }}
        placeholder={t("auth.email")}
        placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        keyboardType="visible-password"
        className="bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl"
        style={{
          marginBottom: 10,
          height: 40,
          paddingHorizontal: 10,
        }}
        placeholder={t("auth.password")}
        placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
        value={password}
        onChangeText={setPassword}
      />
      <Button title={t("auth.login")} onPress={handleLogin} />
      <View style={{ marginTop: 20 }}>
        <Text className="text-neutral-900 dark:text-neutral-100">
          Current Session:
        </Text>
        <Text className="text-neutral-700 dark:text-neutral-300">
          {JSON.stringify(
            {
              session,
              error,
              isPending,
              isRefetching,
            },
            null,
            2
          )}
        </Text>
      </View>
      <Button title={t("auth.logout")} onPress={() => authClient.signOut()} />
    </View>
  );
}
