import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import Snackbar, { SnackbarRef } from '@/components/ui/snackbar';
import { Input } from '@/components/ui/input';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const snackbarRef = useRef<SnackbarRef>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { register } = authClient;
    try {
      await register("email", data);
      router.replace('/(tabs)');
    } catch (error: any) {
      snackbarRef.current?.show(error.message, 3000);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Sign Up</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
      <View style={{ height: 10 }} />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}
      <View style={{ height: 20 }} />
      <Button onPress={handleSubmit(onSubmit)}>
        <Text>Sign Up</Text>
      </Button>
      <View style={{ height: 10 }} />
      <Link href="/(auth)/sign-in" style={{ textAlign: 'center' }}>
        Already have an account? Sign In
      </Link>
      <Snackbar ref={snackbarRef} />
    </SafeAreaView>
  );
}
