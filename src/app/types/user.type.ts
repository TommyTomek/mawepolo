export type User = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata: {
    displayName?: string;
  };
};

export type SignupPayload = {
  email: string;
  password: string;
  options: {
        data: {
          full_name: string;
        }
    }
};

export type LoginPayload = {
  email: string;
  password: string;
};