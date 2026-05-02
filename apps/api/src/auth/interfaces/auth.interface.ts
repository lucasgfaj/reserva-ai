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
