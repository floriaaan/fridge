import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
export default function DebugScreen() {
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("password1234");
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
    <View style={{ padding: 20, marginTop: 50 }}>
      <TextInput
        keyboardType="email-address"
        style={{
          marginBottom: 10,
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          paddingHorizontal: 10,
        }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        keyboardType="visible-password"
        style={{
          marginBottom: 10,
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          paddingHorizontal: 10,
        }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={{ marginTop: 20 }}>
        <Text>Current Session:</Text>
        <Text>
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
      <Button title="Logout" onPress={() => authClient.signOut()} />
    </View>
  );
}
