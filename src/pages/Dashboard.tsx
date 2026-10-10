import { Group, Paper, SimpleGrid, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { currentPeriod, daysBetween, formatDate, rupiah, todayJakarta } from '../format';
import { showError } from '../notify';
import type { Invoice, Room, Summary } from '../types';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Title order={3}>{value}</Title>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  );
}

export function Dashboard() {
  const [period, setPeriod] = useState(currentPeriod());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [overdue, setOverdue] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayJakarta();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [roomList, overdueList, summaryData] = await Promise.all([
          api<Room[]>('/rooms'),
          api<Invoice[]>('/invoices/overdue'),
          period ? api<Summary>(`/invoices/summary?period=${period}`) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setRooms(roomList);
        setOverdue(overdueList);
        setSummary(summaryData);
      } catch (error) {
        if (!cancelled) showError('Could not load the dashboard', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const occupied = rooms.filter((room) => room.status === 'occupied').length;
  const paid = summary?.paid ?? { count: 0, total: 0 };
  const unpaid = summary?.unpaid ?? { count: 0, total: 0 };

  return (
    <Stack>
      <Group justify="space-between" align="flex-end">
        <Title order={2}>Dashboard</Title>
        <TextInput
          type="month"
          label="Month"
          value={period}
          onChange={(event) => setPeriod(event.currentTarget.value)}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <Stat label="Billed" value={rupiah.format(paid.total + unpaid.total)} hint={`${paid.count + unpaid.count} invoice(s)`} />
        <Stat label="Collected" value={rupiah.format(paid.total)} hint={`${paid.count} paid`} />
        <Stat label="Outstanding" value={rupiah.format(unpaid.total)} hint={`${unpaid.count} unpaid`} />
        <Stat label="Occupancy" value={`${occupied} / ${rooms.length}`} hint="rooms occupied" />
      </SimpleGrid>

      <Title order={3} mt="md">
        Overdue invoices
      </Title>
      <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
        {loading ? (
          <Text p="md" c="dimmed">
            Loading...
          </Text>
        ) : overdue.length === 0 ? (
          <Text p="md" c="dimmed">
            Nothing overdue. Nice!
          </Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tenant</Table.Th>
                <Table.Th>Month</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Due date</Table.Th>
                <Table.Th>Days overdue</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {overdue.map((invoice) => (
                <Table.Tr key={invoice.id}>
                  <Table.Td>{invoice.tenant?.name ?? '-'}</Table.Td>
                  <Table.Td>{invoice.period}</Table.Td>
                  <Table.Td>{rupiah.format(invoice.amount)}</Table.Td>
                  <Table.Td>{formatDate(invoice.dueDate)}</Table.Td>
                  <Table.Td>{daysBetween(invoice.dueDate, today)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
