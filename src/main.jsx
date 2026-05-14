import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store/store";
import App from "./App.jsx";

import { AppProvider } from "./contexts/AppContext";

import "./styles/layout.module.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <AppProvider>
          <App />
        </AppProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);