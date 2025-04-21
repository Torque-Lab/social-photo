import { z } from "zod";

export const SignUpSchema = z.object({
    username: z.string().min(3).max(36),
    password: z
      .string()
      .min(8)
      .max(36)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      ),
    name: z.string(),
    image: z.string().optional(),
});



