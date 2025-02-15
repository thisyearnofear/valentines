import { z } from "zod";

export const multiply = ({ a, b }: { a: number; b: number }): string => {
  return `The result of ${a} multiplied by ${b} is ${a * b}.`;
};

export const multiplyMetadata = {
  name: "multiply",
  description: "Multiply two numbers together.",
  schema: z.object({
    a: z.number().describe("First number to multiply"),
    b: z.number().describe("Second number to multiply"),
  }),
};
