import { CookiesProvider } from "react-cookie";
import "./App.css";
import { NavigationProvider } from "./providers";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <CookiesProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        autoHideDuration={4000}
      >
        <NavigationProvider />
      </SnackbarProvider>
    </CookiesProvider>
  );
}

export default App;
