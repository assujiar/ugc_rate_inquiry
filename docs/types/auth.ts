export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role_id: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  access_token: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  token_type: string;
}