export interface BlockOutput {
  id: string;
  name: string;
  condominiumId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockListOutput {
  blocks: BlockOutput[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlockCreatedOutput {
  id: string;
  name: string;
  condominiumId: string;
  createdAt: Date;
}

export interface BlockUpdatedOutput {
  id: string;
  name: string;
  condominiumId: string;
  updatedAt: Date;
}

export interface BlockDeletedOutput {
  message: string;
}
