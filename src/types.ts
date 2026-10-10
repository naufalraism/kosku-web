export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  number: string;
  price: number;
  status: RoomStatus;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  roomId: string | null;
  room?: Room | null;
  moveInDate: string;
  leaseEnd: string | null;
  createdAt: string;
}

export type InvoiceStatus = 'unpaid' | 'paid';

export interface Invoice {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  period: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface SummaryLine {
  count: number;
  total: number;
}

export interface Summary {
  period: string;
  paid: SummaryLine;
  unpaid: SummaryLine;
}
