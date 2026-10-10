import { Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { showError } from '../notify';

export function Login() {
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.length >= 8 ? null : 'At least 8 characters'),
    },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(values: { email: string; password: string }) {
    setLoading(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      showError('Login failed', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center mih="100vh" p="md">
      <Paper withBorder shadow="sm" p="xl" radius="md" w={380}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <div>
              <Title order={2}>KosKu</Title>
              <Text c="dimmed" size="sm">
                Sign in to manage your boarding house
              </Text>
            </div>
            <TextInput label="Email" placeholder="admin@example.com" {...form.getInputProps('email')} />
            <PasswordInput label="Password" {...form.getInputProps('password')} />
            <Button type="submit" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
