const { z } = require("zod");

const optionSchema = z.object({
  optionId: z.string().min(1),
  text: z.string().min(1).max(200).trim(),
});

const questionSchema = z
  .object({
    questionId: z.string().min(1),

    text: z.string().min(1).max(500).trim(),

    type: z.enum([
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "YES_NO",
      "RATING",
    ]),

    options: z.array(optionSchema).default([]),

    required: z.boolean().default(true),
  })
  .superRefine((question, ctx) => {
    if (
      ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.type) &&
      question.options.length < 2
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Choice questions need at least 2 options",
        path: ["options"],
      });
    }

    if (question.type === "YES_NO") {
      if (question.options.length !== 0) {
        ctx.addIssue({
          code: "custom",
          message: "YES_NO questions should not contain custom options",
          path: ["options"],
        });
      }
    }

    if (question.type === "RATING") {
      if (question.options.length !== 0) {
        ctx.addIssue({
          code: "custom",
          message: "RATING questions should not contain options",
          path: ["options"],
        });
      }
    }
  });

const createSurveySchema = z
  .object({
    title: z.string().min(3).max(150).trim(),

    description: z.string().min(10).max(2000).trim(),

    questions: z
      .array(questionSchema)
      .min(1, "At least one question is required"),

    location: z.object({
      city: z.string().min(2).max(100).trim(),

      latitude: z.number().min(-90).max(90),

      longitude: z.number().min(-180).max(180),

      radius: z.number().min(1).max(100),
    }),

    startTime: z.coerce.date(),

    endTime: z.coerce.date(),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );
const updateSurveySchema = z
  .object({
    title: z.string().min(3).max(150).trim(),

    description: z.string().min(10).max(2000).trim(),

    questions: z
      .array(questionSchema)
      .min(1, "At least one question is required"),

    location: z.object({
      city: z.string().min(2).max(100).trim(),

      latitude: z.number().min(-90).max(90),

      longitude: z.number().min(-180).max(180),

      radius: z.number().min(1).max(100),
    }),

    startTime: z.coerce.date(),

    endTime: z.coerce.date(),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

module.exports = {
  createSurveySchema,
  updateSurveySchema,
};
