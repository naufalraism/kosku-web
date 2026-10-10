import { Badge, Button, Group, Paper, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { currentPeriod, formatDate, formatTimestamp, rupiah, todayJakarta } from '../format';
import { showError, showSuccess } from '../notify';
import type { Invoice } from '../types';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
];

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [period, setPeriod] = useState(currentPeriod());
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const today = todayJakarta();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period) params.set('period', period);
      if (status !== 'all') params.set('status', status);
      const query = params.toString();
      setInvoices(await api<Invoice[]>(`/invoices${query ? `?${query}` : ''}`));
    } catch (error) {
      showError('Could not load invoices', error);
    } finally {
      setLoading(false);
    }
  }, [period, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    if (!period) {
      showError('Pick a month first', new Error('Choose the billing month to generate invoices for'));
      return;
    }
    setGenerating(true);
    try {
      const result = await api<{ period: string; created: number; skipped: number }>('/invoices/generate', {
        method: 'POST',
        body: { period },
      });
      showSuccess(`${result.created} invoice(s) created, ${result.skipped} already existed`);
      await load();
    } catch (error) {
      showError('Could not generate invoices', error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleMarkPaid(invoice: Invoice) {
    try {
      await api(`/invoices/${invoice.id}/pay`, { method: 'PATCH' });
      showSuccess(`Invoice for ${invoice.tenant?.name ?? 'tenant'} marked as paid`);
      await load();
    } catch (error) {
      showError('Could not mark as paid', error);
    }
  }

  function renderStatus(invoice: Invoice) {
    if (invoice.status === 'paid') {
      return (
        <Badge color="teal" variant="light">
          paid
        </Badge>
      );
    }
    const overdue = invoice.dueDate < today;
    return (
      <Badge color={overdue ? 'red' : 'yellow'} variant="light">
        {overdue ? 'overdue' : 'unpaid'}
      </Badge>
    );
  }

  return (
    <Stack>
      <Title order={2}>Invoices</Title>

      <Group align="flex-end">
        <TextInput
          type="month"
          label="Billing month"
          value={period}
          onChange={(event) => setPeriod(event.currentTarget.value)}
        />
        <Select
          label="Status"
          data={statusOptions}
          value={status}
          onChange={(value) => setStatus(value ?? 'all')}
          allowDeselect={false}
        />
        <Button onClick={handleGenerate} loading={generating}>
          Generate invoices
        </Button>
      </Group>

      <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
        {loading ? (
          <Text p="md" c="dimmed">
            Loading...
          </Text>
        ) : invoices.length === 0 ? (
          <Text p="md" c="dimmed">
            No invoices for this selection. Pick a month and click Generate invoices.
          </Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tenant</Table.Th>
                <Table.Th>Month</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Due date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Paid on</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoices.map((invoice) => (
                <Table.Tr key={invoice.id}>
                  <Table.Td>{invoice.tenant?.name ?? '-'}</Table.Td>
                  <Table.Td>{invoice.period}</Table.Td>
                  <Table.Td>{rupiah.format(invoice.amount)}</Table.Td>
                  <Table.Td>{formatDate(invoice.dueDate)}</Table.Td>
                  <Table.Td>{renderStatus(invoice)}</Table.Td>
                  <Table.Td>{formatTimestamp(invoice.paidAt)}</Table.Td>
                  <Table.Td ta="right">
                    {invoice.status === 'unpaid' && (
                      <Button size="xs" variant="light" onClick={() => handleMarkPaid(invoice)}>
                        Mark paid
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
