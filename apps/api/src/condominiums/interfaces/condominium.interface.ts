export interface CondominiumOutput {
  id: string;
  name: string;
  address: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CondominiumUpdateInput {
  name?: string;
  address?: string;
  timezone?: string;
}
