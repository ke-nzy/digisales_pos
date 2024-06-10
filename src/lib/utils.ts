import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const authFormSchema = () =>
  z
    .object({
      // sign in
      site_name: z
        .string({
          required_error: "Please enter Site name.",
        })
        .min(1, {
          message: "Please enter site name.",
        }),
      username: z
        .string({
          required_error: "Please Enter UserName.",
        })
        .min(1, {
          message: "Please enter valid username.",
        }),
      password: z.string({
        required_error: "Please Enter Password.",
      }),
    })
    .required();

export function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
