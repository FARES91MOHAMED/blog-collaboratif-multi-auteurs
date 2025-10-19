export interface User {
  _id?: string; // ou id
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  [key: string]: any;
}
