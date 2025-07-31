import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters").max(20, "Username must be less than 20 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  password2: z.string().min(3, "Confirm password must be at least 3 characters"),
}).refine((data) => data.password === data.password2, {
  message: "Passwords do not match",
  path: ["password2"], // this path will attach the error to the password2 field
});

export type RegisterFormInputs = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters").max(20, "Username must be less than 20 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;