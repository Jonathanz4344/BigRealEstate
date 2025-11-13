import { GoogleRequiredModal } from "../components";
import { useAutoLogin } from "../hooks";
import { useAuthStore, useGoogleRequiredStore } from "../stores";
import { AppLayout } from "./AppLayout";
import { AuthLayout } from "./AuthLayout";

export const RootLayout = () => {
  const user = useAuthStore((state) => state.user);
  const { showGoogleRequired, setShowGoogleRequired } =
    useGoogleRequiredStore();
  useAutoLogin();
  return (
    <div className="full">
      {user ? <AppLayout /> : <AuthLayout />}
      <GoogleRequiredModal
        open={showGoogleRequired}
        onClose={() => setShowGoogleRequired(false)}
      />
    </div>
  );
};
