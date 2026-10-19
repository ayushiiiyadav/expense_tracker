const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80, "Title is too long"),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(80).optional(),
    status: z.enum(["pending", "in-progress", "completed"]).optional(),
  })
  .refine((data) => data.title !== undefined || data.status !== undefined, {
    message: "Provide a title or a status to update",
  });

module.exports = {
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
}; 