import { Alert, Button, Center, Divider, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { demoForced } from '../mode';
import { showError } from '../notify';

export function Login() {
  const { isAuthenticated, login, startDemo } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: demoForced ? { email: 'demo@kosku.app', password: 'demo12345' } : { email: '', password: '' },
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
            {demoForced && (
              <Alert color="yellow" variant="light" title="Demo mode">
                Sample data stored only in your browser. The credentials are pre-filled, just press Sign in.
              </Alert>
            )}
            <TextInput label="Email" placeholder="owner@example.com" {...form.getInputProps('email')} />
            <PasswordInput label="Password" {...form.getInputProps('password')} />
            <Button type="submit" loading={loading}>
              Sign in
            </Button>
            {!demoForced && (
              <>
                <Divider label="or" labelPosition="center" />
                <Button variant="default" onClick={startDemo} disabled={loading}>
                  Try the demo
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  The demo uses sample data that stays in your browser. No account needed.
                </Text>
              </>
            )}
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
