import { z } from "zod";

export const SignInSchema = z.object({
    email: z.email({ message: "Invalid email" }),
    password: z.string({ message: "Invalid password" }).min(8, "Password must be at least 8 characters").max(20, "Password must be at most 20 characters"),
});

export const SignUpSchema = z.object({
    email: z.email({ message: "Invalid email" }),
    password: z.string({ message: "Invalid password" }).min(8, "Password must be at least 8 characters").max(20, "Password must be at most 20 characters"),
    fullName: z.string("Invalid full name").min(3, "Full name must be at least 3 characters").max(50, "Full name must be at most 50 characters"),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
