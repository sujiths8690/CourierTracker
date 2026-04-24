import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(4, "Min 4 chars").required("Password required"),
});

export const registerSchema = yup.object({
  name: yup.string().required("Name required"),
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(4, "Min 4 chars").required("Password required"),
});