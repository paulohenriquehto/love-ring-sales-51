export type AccessLevel = 'user' | 'manager' | 'admin';

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_user_id?: string;
  budget_limit?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: AccessLevel;
  department_id?: string;
  position?: string;
  budget_limit?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  departments?: Department;
}

export interface AuthContextType {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, departmentId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}