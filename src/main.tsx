import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

const rootElement = document.getElementById("root")!;

// Hydrate the server-rendered content with BrowserRouter for client-side
hydrateRoot(rootElement, (
  <BrowserRouter>
    <App />
  </BrowserRouter>
));
