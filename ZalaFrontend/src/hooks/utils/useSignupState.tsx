import { useState } from "react";
import { useErrors } from "./useErrors";

export const useSignupState = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [errors, setErrors] = useErrors();
  return {
    userName,
    setUserName,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    rePassword,
    setRePassword,
    errors,
    setErrors,
  };
};
