export interface CreateReservationInput {
  commonAreaId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  residentId?: string;
}

export interface ListReservationsQuery {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
}

export interface ReservationListOutput {
  reservations: ReservationOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReservationOutput {
  id: string;
  residentId: string;
  commonAreaId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  canceledById: string | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  commonArea?: {
    id: string;
    name: string;
    icon: string | null;
    capacity: number | null;
  };
  resident?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}
