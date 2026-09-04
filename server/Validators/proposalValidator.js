const { z } = require("zod");

const createProposalSchema = z
  .object({
    title: z
      .string()
      .min(3)
      .max(150)
      .trim(),

    description: z
      .string()
      .min(10)
      .max(2000)
      .trim(),

    purpose: z
      .string()
      .min(5)
      .max(1000)
      .trim(),

    location: z.object({
      city: z.string().min(2).max(100).trim(),

      latitude: z
        .number()
        .min(-90)
        .max(90),

      longitude: z
        .number()
        .min(-180)
        .max(180),
    }),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),
  })
  .refine(
    (data) => data.endDate > data.startDate,
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

module.exports = {
  createProposalSchema,
};