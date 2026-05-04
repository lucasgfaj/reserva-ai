export interface ResidentListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  canBook: boolean;
  document?: string;
  phone?: string;
  unitId?: string;
  createdAt: Date;
}

export interface CreateResidentInput {
  name: string;
  email: string;
  password?: string;
  unitId?: string;
  document?: string;
  phone?: string;
  canBook?: boolean;
}

export interface ResidentListOutput {
  residents: ResidentListItem[];
  total: number;
}

export interface ResidentDetailOutput {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  canBook: boolean;
  document?: string;
  phone?: string;
  unitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateResidentPermissionsOutput {
  message: string;
  canBook: boolean;
}

export interface CreateResidentOutput {
  message: string;
  accessToken: string;
  temporaryPassword: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
