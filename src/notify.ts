import { notifications } from '@mantine/notifications';

export function showError(title: string, error: unknown) {
  notifications.show({
    color: 'red',
    title,
    message: error instanceof Error ? error.message : 'Something went wrong',
  });
}

export function showSuccess(message: string) {
  notifications.show({ color: 'teal', message });
}
