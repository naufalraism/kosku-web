import { Button, Group, Modal, Paper, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { formatDate, rupiah } from '../format';
import { showError, showSuccess } from '../notify';
import type { Room, Tenant } from '../types';

interface FormValues {
  name: string;
  phone: string;
  roomId: string | null;
  moveInDate: string;
  leaseEnd: string;
}

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<FormValues>({
    initialValues: { name: '', phone: '', roomId: null, moveInDate: '', leaseEnd: '' },
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required'),
      phone: (value) => (value.trim() ? null : 'Phone is required'),
      moveInDate: (value) => (value ? null : 'Move-in date is required'),
      leaseEnd: (value, values) =>
        value && values.moveInDate && value < values.moveInDate ? 'Must be after the move-in date' : null,
    },
  });

  const load = useCallback(async () => {
    try {
      const [tenantList, roomList] = await Promise.all([api<Tenant[]>('/tenants'), api<Room[]>('/rooms')]);
      setTenants(tenantList);
      setRooms(roomList);
    } catch (error) {
      showError('Could not load tenants', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roomOptions = rooms
    .filter((room) => room.status === 'available')
    .map((room) => ({ value: room.id, label: `${room.number} (${rupiah.format(room.price)})` }));

  async function handleAdd(values: FormValues) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        moveInDate: values.moveInDate,
      };
      if (values.roomId) body.roomId = values.roomId;
      if (values.leaseEnd) body.leaseEnd = values.leaseEnd;

      await api<Tenant>('/tenants', { method: 'POST', body });
      showSuccess(`${values.name.trim()} added`);
      form.reset();
      close();
      await load();
    } catch (error) {
      showError('Could not add tenant', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tenant: Tenant) {
    if (!window.confirm(`Delete ${tenant.name}? Their invoices will be deleted too.`)) return;
    try {
      await api(`/tenants/${tenant.id}`, { method: 'DELETE' });
      showSuccess(`${tenant.name} deleted`);
      await load();
    } catch (error) {
      showError('Could not delete tenant', error);
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Tenants</Title>
        <Button onClick={open}>Add tenant</Button>
      </Group>

      <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
        {loading ? (
          <Text p="md" c="dimmed">
            Loading...
          </Text>
        ) : tenants.length === 0 ? (
          <Text p="md" c="dimmed">
            No tenants yet. Add your first tenant.
          </Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Phone</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Move-in</Table.Th>
                <Table.Th>Lease end</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tenants.map((tenant) => (
                <Table.Tr key={tenant.id}>
                  <Table.Td>{tenant.name}</Table.Td>
                  <Table.Td>{tenant.phone}</Table.Td>
                  <Table.Td>{tenant.room?.number ?? '-'}</Table.Td>
                  <Table.Td>{formatDate(tenant.moveInDate)}</Table.Td>
                  <Table.Td>{formatDate(tenant.leaseEnd)}</Table.Td>
                  <Table.Td ta="right">
                    <Button variant="subtle" color="red" size="xs" onClick={() => handleDelete(tenant)}>
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={opened} onClose={close} title="Add tenant">
        <form onSubmit={form.onSubmit(handleAdd)}>
          <Stack>
            <TextInput label="Name" {...form.getInputProps('name')} />
            <TextInput label="Phone" placeholder="0812..." {...form.getInputProps('phone')} />
            <Select
              label="Room"
              placeholder={roomOptions.length === 0 ? 'No available rooms' : 'Pick an available room'}
              data={roomOptions}
              clearable
              {...form.getInputProps('roomId')}
            />
            <TextInput type="date" label="Move-in date" {...form.getInputProps('moveInDate')} />
            <TextInput type="date" label="Lease end (optional)" {...form.getInputProps('leaseEnd')} />
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
