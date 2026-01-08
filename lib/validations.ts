import { z } from "zod";

export const maintenanceRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  propertyAddress: z.string().optional(),
  category: z.enum(["Plumbing", "Electrical", "HVAC", "Structural", "Other"]).optional().or(z.literal("")),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
