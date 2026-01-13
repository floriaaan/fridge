import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        source={require('../../assets/animations/welcome.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Welcome</Text>
      <Link href="/(auth)/sign-in" asChild>
        <Button>
          <Text>Sign In</Text>
        </Button>
      </Link>
      <View style={{ height: 10 }} />
      <Link href="/(auth)/sign-up" asChild>
        <Button>
          <Text>Sign Up</Text>
        </Button>
      </Link>
    </SafeAreaView>
  );
}
