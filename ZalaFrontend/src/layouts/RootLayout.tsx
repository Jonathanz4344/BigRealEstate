import { useAutoLogin } from "../hooks";
import { useAuthStore } from "../stores";
import { AppLayout } from "./AppLayout";
import { AuthLayout } from "./AuthLayout";

export const RootLayout = () => {
  const user = useAuthStore((state) => state.user);
  useAutoLogin();
  return user ? <AppLayout /> : <AuthLayout />;
};
