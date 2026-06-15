export interface UnitOutput {
  id: string;
  number: string;
  blockId: string;
  blockName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitListOutput {
  units: UnitOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnitCreatedOutput {
  id: string;
  number: string;
  blockId: string;
  createdAt: Date;
}

export interface UnitUpdatedOutput {
  id: string;
  number: string;
  blockId: string;
  updatedAt: Date;
}

export interface UnitDeletedOutput {
  message: string;
}
