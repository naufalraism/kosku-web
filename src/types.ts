export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  number: string;
  price: number;
  status: RoomStatus;
}
