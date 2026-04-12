const { z } = require("zod");

const emailValidator = z
  .string()
  .regex(/^[\w.-]+@gmail\.com$/, "Only @gmail.com emails allowed");

exports.registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(6, "Username must be at least 6 characters"),
    email: emailValidator,
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password === data.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password cannot match username",
      });
    }

    const emailLocal = data.email.split("@")[0];
    if (data.password === emailLocal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password cannot match email",
      });
    }
  });

exports.loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Password is required"),
});
