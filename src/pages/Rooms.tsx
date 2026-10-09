import { Badge, Button, Group, Modal, NumberInput, Paper, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { showError, showSuccess } from '../notify';
import type { Room } from '../types';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: { number: '', price: 0 },
    validate: {
      number: (value) => (value.trim() ? null : 'Room number is required'),
      price: (value) => (Number(value) > 0 ? null : 'Price must be greater than 0'),
    },
  });

  const loadRooms = useCallback(async () => {
    try {
      setRooms(await api<Room[]>('/rooms'));
    } catch (error) {
      showError('Could not load rooms', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  async function handleAdd(values: { number: string; price: number }) {
    setSaving(true);
    try {
      await api<Room>('/rooms', {
        method: 'POST',
        body: { number: values.number.trim(), price: Number(values.price) },
      });
      showSuccess(`Room ${values.number.trim()} added`);
      form.reset();
      close();
      await loadRooms();
    } catch (error) {
      showError('Could not add room', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(room: Room) {
    if (!window.confirm(`Delete room ${room.number}?`)) return;
    try {
      await api(`/rooms/${room.id}`, { method: 'DELETE' });
      showSuccess(`Room ${room.number} deleted`);
      await loadRooms();
    } catch (error) {
      showError('Could not delete room', error);
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Rooms</Title>
        <Button onClick={open}>Add room</Button>
      </Group>

      <Paper withBorder radius="md">
        {loading ? (
          <Text p="md" c="dimmed">
            Loading...
          </Text>
        ) : rooms.length === 0 ? (
          <Text p="md" c="dimmed">
            No rooms yet. Add your first room.
          </Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Room</Table.Th>
                <Table.Th>Price / month</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rooms.map((room) => (
                <Table.Tr key={room.id}>
                  <Table.Td>{room.number}</Table.Td>
                  <Table.Td>{rupiah.format(room.price)}</Table.Td>
                  <Table.Td>
                    <Badge color={room.status === 'available' ? 'teal' : 'orange'} variant="light">
                      {room.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Button variant="subtle" color="red" size="xs" onClick={() => handleDelete(room)}>
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={opened} onClose={close} title="Add room">
        <form onSubmit={form.onSubmit(handleAdd)}>
          <Stack>
            <TextInput label="Room number" placeholder="A1" {...form.getInputProps('number')} />
            <NumberInput
              label="Price per month (IDR)"
              min={0}
              step={50000}
              thousandSeparator
              {...form.getInputProps('price')}
            />
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
