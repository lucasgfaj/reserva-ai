export interface CommonAreaOutput {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  openTime: string;
  closeTime: string;
  operatingDays: string | null;
  requiresApproval: boolean;
  icon: string | null;
  isUnderMaintenance: boolean;
  condominiumId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommonAreaListOutput {
  commonAreas: CommonAreaOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommonAreaDetailOutput extends CommonAreaOutput {}

export interface CommonAreaCreatedOutput extends CommonAreaOutput {
  createdAt: Date;
}

export interface CommonAreaUpdatedOutput extends CommonAreaOutput {
  updatedAt: Date;
}

export interface CommonAreaDeletedOutput {
  message: string;
  id: string;
}

export interface CreateCommonAreaInput {
  name: string;
  description?: string;
  capacity?: number;
  openTime: string;
  closeTime: string;
  operatingDays?: string;
  requiresApproval?: boolean;
  icon?: string;
  isUnderMaintenance?: boolean;
}

export interface UpdateCommonAreaInput {
  name?: string;
  description?: string;
  capacity?: number;
  openTime?: string;
  closeTime?: string;
  operatingDays?: string;
  requiresApproval?: boolean;
  icon?: string;
  isUnderMaintenance?: boolean;
}

export interface AvailabilityOutput {
  available: boolean;
  date: string;
  commonAreaId: string;
  commonAreaName: string;
  openTime: string;
  closeTime: string;
  startTime?: string;
  endTime?: string;
  conflicts: {
    startTime: string;
    endTime: string;
    status: string;
  }[];
}

export interface CheckAvailabilityInput {
  date: string;
  startTime?: string;
  endTime?: string;
}

export interface BusyDaysOutput {
  commonAreaId: string;
  year: number;
  month: number;
  busyDates: string[];
}

export interface CreateCommonAreaValidationResult {
  isValid: boolean;
  errors: string[];
}
