export interface RegisterTenantInput {
  condominiumName: string;
  condominiumAddress: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface RegisterTenantOutput {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  condominium: {
    id: string;
    name: string;
  };
}

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
  condominiumId: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  condominium: {
    id: string;
    name: string;
  };
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

export interface CreateResidentOutput {
  message: string;
  accessToken: string;
  temporaryPassword?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

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

export interface UpdateResidentPermissionsInput {
  canBook: boolean;
}

export interface UpdateResidentPermissionsOutput {
  message: string;
  canBook: boolean;
}
