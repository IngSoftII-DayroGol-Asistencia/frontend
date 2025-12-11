export interface UserRegistrationInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;  
  email: string;
  password: string;
  phone: string;
}

export interface UserRegistrationResponse {
  data: UserRegistrationResponse | PromiseLike<UserRegistrationResponse>;
  id: string;
  email: string;
  password: string;   // hash bcrypt
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;  // ISO datetime string
  updatedAt: string;  // ISO datetime string
}