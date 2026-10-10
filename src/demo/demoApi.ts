/**
 * A tiny in-browser imitation of the KosKu API, used for the public demo.
 * It follows the same rules as the real backend (unique room numbers, room status
 * changes, invoice generation, overdue logic) and keeps its data in this browser only.
 */
import { ApiError } from '../errors';
import { currentPeriod, todayJakarta } from '../format';
import type { Invoice, Room, Summary, Tenant } from '../types';

interface StoredTenant {
  id: string;
  name: string;
  phone: string;
  roomId: string | null;
  moveInDate: string;
  leaseEnd: string | null;
  createdAt: string;
}

interface StoredInvoice {
  id: string;
  tenantId: string;
  period: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
  paidAt: string | null;
  createdAt: string;
}

interface Db {
  rooms: Room[];
  tenants: StoredTenant[];
  invoices: StoredInvoice[];
}

interface DemoOptions {
  method?: string;
  body?: unknown;
}

const STORAGE_KEY = 'kosku_demo_db_v1';
const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const PERIOD_MESSAGE = 'period must be in YYYY-MM format, e.g. 2026-10';

let db: Db | null = null;

// ---------- small helpers ----------

function fail(status: number, message: string): never {
  throw new ApiError(status, message);
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function shiftPeriod(period: string, delta: number): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function lastDayOf(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${period}-${String(day).padStart(2, '0')}`;
}

function requirePeriod(value: unknown): string {
  if (typeof value !== 'string' || !PERIOD_REGEX.test(value)) fail(400, PERIOD_MESSAGE);
  return value;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// ---------- storage ----------

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage can be unavailable (private mode); the demo then works for this session only.
  }
}

export function resetDemo() {
  db = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function seed(): Db {
  const thisMonth = currentPeriod();
  const lastMonth = shiftPeriod(thisMonth, -1);
  const moveIn = `${shiftPeriod(thisMonth, -3)}-01`;
  const now = new Date().toISOString();

  const rooms: Room[] = [
    { id: newId(), number: 'A1', price: 1500000, status: 'occupied' },
    { id: newId(), number: 'A2', price: 1500000, status: 'occupied' },
    { id: newId(), number: 'A3', price: 1750000, status: 'occupied' },
    { id: newId(), number: 'B1', price: 1200000, status: 'occupied' },
    { id: newId(), number: 'B2', price: 1200000, status: 'occupied' },
    { id: newId(), number: 'B3', price: 2000000, status: 'available' },
  ];

  const people: Array<[string, string, string]> = [
    ['Budi Santoso', '0812-0000-0001', 'A1'],
    ['Sari Wulandari', '0812-0000-0002', 'A2'],
    ['Dewi Lestari', '0812-0000-0003', 'A3'],
    ['Rudi Hartono', '0812-0000-0004', 'B1'],
    ['Andi Pratama', '0812-0000-0005', 'B2'],
  ];

  const tenants: StoredTenant[] = people.map(([name, phone, roomNumber]) => ({
    id: newId(),
    name,
    phone,
    roomId: rooms.find((room) => room.number === roomNumber)?.id ?? null,
    moveInDate: moveIn,
    leaseEnd: null,
    createdAt: now,
  }));

  const data: Db = { rooms, tenants, invoices: [] };
  generateInvoices(data, lastMonth);
  generateInvoices(data, thisMonth);

  // Make the sample data interesting: some paid, some overdue.
  const unpaidLastMonth = new Set(['Rudi Hartono', 'Andi Pratama']);
  for (const invoice of data.invoices) {
    const name = data.tenants.find((tenant) => tenant.id === invoice.tenantId)?.name ?? '';
    const shouldBePaid =
      invoice.period === lastMonth ? !unpaidLastMonth.has(name) : name === 'Budi Santoso';
    if (shouldBePaid) {
      invoice.status = 'paid';
      invoice.paidAt = now;
    }
  }
  return data;
}

function load(): Db {
  if (db) return db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      db = JSON.parse(raw) as Db;
      return db;
    }
  } catch {
    // fall through to a fresh seed
  }
  db = seed();
  save();
  return db;
}

// ---------- domain logic (mirrors the backend) ----------

function generateInvoices(data: Db, period: string) {
  const periodStart = `${period}-01`;
  const periodEnd = lastDayOf(period);
  const eligible = data.tenants.filter(
    (tenant) =>
      tenant.roomId !== null &&
      tenant.moveInDate <= periodEnd &&
      (!tenant.leaseEnd || tenant.leaseEnd >= periodStart),
  );
  const alreadyBilled = new Set(
    data.invoices.filter((invoice) => invoice.period === period).map((invoice) => invoice.tenantId),
  );

  let created = 0;
  for (const tenant of eligible) {
    if (alreadyBilled.has(tenant.id)) continue;
    const room = data.rooms.find((candidate) => candidate.id === tenant.roomId);
    if (!room) continue;
    data.invoices.push({
      id: newId(),
      tenantId: tenant.id,
      period,
      amount: room.price,
      dueDate: `${period}-10`,
      status: 'unpaid',
      paidAt: null,
      createdAt: new Date().toISOString(),
    });
    created += 1;
  }
  return { period, created, skipped: eligible.length - created };
}

function occupyRoom(data: Db, roomId: string) {
  const room = data.rooms.find((candidate) => candidate.id === roomId);
  if (!room) fail(404, 'Room not found');
  if (room.status === 'occupied') fail(409, `Room ${room.number} is already occupied`);
  room.status = 'occupied';
}

function releaseRoom(data: Db, roomId: string | null) {
  const room = data.rooms.find((candidate) => candidate.id === roomId);
  if (room) room.status = 'available';
}

function toTenant(data: Db, stored: StoredTenant): Tenant {
  const room = data.rooms.find((candidate) => candidate.id === stored.roomId) ?? null;
  return { ...stored, room };
}

function toInvoice(data: Db, stored: StoredInvoice): Invoice {
  const tenant = data.tenants.find((candidate) => candidate.id === stored.tenantId);
  return { ...stored, tenant: tenant ? toTenant(data, tenant) : undefined };
}

// ---------- request handling ----------

export async function demoRequest<T>(path: string, options: DemoOptions = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120)); // feel like a network call

  const method = (options.method ?? 'GET').toUpperCase();
  const url = new URL(path, 'http://demo.local');
  const route = `${method} ${url.pathname}`;
  const body = (options.body ?? {}) as Record<string, unknown>;
  const data = load();
  let match: RegExpMatchArray | null;

  // --- auth ---
  if (route === 'POST /auth/login') return { accessToken: 'demo-token' } as T;
  if (route === 'POST /auth/register') fail(403, 'Registration is disabled in demo mode');

  // --- rooms ---
  if (route === 'GET /rooms') {
    return clone([...data.rooms].sort((a, b) => a.number.localeCompare(b.number))) as T;
  }
  if (route === 'POST /rooms') {
    const number = text(body.number);
    const price = Number(body.price);
    if (!number) fail(400, 'number should not be empty');
    if (!Number.isFinite(price) || price < 0) fail(400, 'price must not be less than 0');
    if (data.rooms.some((room) => room.number === number)) fail(409, `Room ${number} already exists`);
    const room: Room = { id: newId(), number, price, status: 'available' };
    data.rooms.push(room);
    save();
    return clone(room) as T;
  }
  if ((match = route.match(/^DELETE \/rooms\/([^/]+)$/))) {
    const index = data.rooms.findIndex((room) => room.id === match![1]);
    if (index === -1) fail(404, 'Room not found');
    const [removed] = data.rooms.splice(index, 1);
    for (const tenant of data.tenants) {
      if (tenant.roomId === removed.id) tenant.roomId = null;
    }
    save();
    return { deleted: true } as T;
  }

  // --- tenants ---
  if (route === 'GET /tenants') {
    const list = [...data.tenants].sort((a, b) => a.name.localeCompare(b.name));
    return clone(list.map((tenant) => toTenant(data, tenant))) as T;
  }
  if (route === 'POST /tenants') {
    const name = text(body.name);
    const phone = text(body.phone);
    const moveInDate = text(body.moveInDate);
    if (!name) fail(400, 'name should not be empty');
    if (!phone) fail(400, 'phone should not be empty');
    if (!moveInDate) fail(400, 'moveInDate must be a valid ISO 8601 date string');
    const roomId = text(body.roomId) || null;
    const leaseEnd = text(body.leaseEnd) || null;
    if (roomId) occupyRoom(data, roomId);
    const tenant: StoredTenant = {
      id: newId(),
      name,
      phone,
      roomId,
      moveInDate,
      leaseEnd,
      createdAt: new Date().toISOString(),
    };
    data.tenants.push(tenant);
    save();
    return clone(toTenant(data, tenant)) as T;
  }
  if ((match = route.match(/^DELETE \/tenants\/([^/]+)$/))) {
    const index = data.tenants.findIndex((tenant) => tenant.id === match![1]);
    if (index === -1) fail(404, 'Tenant not found');
    const [removed] = data.tenants.splice(index, 1);
    releaseRoom(data, removed.roomId);
    data.invoices = data.invoices.filter((invoice) => invoice.tenantId !== removed.id); // cascade
    save();
    return { deleted: true } as T;
  }

  // --- invoices ---
  if (route === 'POST /invoices/generate') {
    const period = requirePeriod(body.period);
    const result = generateInvoices(data, period);
    save();
    return result as T;
  }
  if (route === 'GET /invoices/overdue') {
    const today = todayJakarta();
    const list = data.invoices
      .filter((invoice) => invoice.status === 'unpaid' && invoice.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return clone(list.map((invoice) => toInvoice(data, invoice))) as T;
  }
  if (route === 'GET /invoices/summary') {
    const period = requirePeriod(url.searchParams.get('period'));
    const summary: Summary = {
      period,
      paid: { count: 0, total: 0 },
      unpaid: { count: 0, total: 0 },
    };
    for (const invoice of data.invoices) {
      if (invoice.period !== period) continue;
      const line = invoice.status === 'paid' ? summary.paid : summary.unpaid;
      line.count += 1;
      line.total += invoice.amount;
    }
    return summary as T;
  }
  if (route === 'GET /invoices') {
    const period = url.searchParams.get('period');
    const status = url.searchParams.get('status');
    if (period) requirePeriod(period);
    if (status && status !== 'paid' && status !== 'unpaid') fail(400, 'status must be paid or unpaid');
    const list = data.invoices
      .filter((invoice) => (!period || invoice.period === period) && (!status || invoice.status === status))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return clone(list.map((invoice) => toInvoice(data, invoice))) as T;
  }
  if ((match = route.match(/^PATCH \/invoices\/([^/]+)\/pay$/))) {
    const invoice = data.invoices.find((candidate) => candidate.id === match![1]);
    if (!invoice) fail(404, 'Invoice not found');
    if (invoice.status === 'paid') fail(409, 'Invoice is already paid');
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    save();
    return clone(toInvoice(data, invoice)) as T;
  }

  return fail(404, `Not found: ${route}`);
}
