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

const transactionFields = {
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().trim().min(1, "Category is required").max(30),
  note: z.string().trim().max(100).optional(),
  date: z.coerce.date().optional(),
};

const createTransactionSchema = z.object(transactionFields);

const updateTransactionSchema = z
  .object(transactionFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = {
  registerSchema,
  loginSchema,
  createTransactionSchema,
  updateTransactionSchema,
};