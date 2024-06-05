import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./css/style.css";
import "./charts/ChartjsConfig";

import AppRoutes from "./routes/route";
import store, { migrations } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

// import {
//   ChoroplethController,
//   GeoFeature,
//   ColorScale,
//   ProjectionScale,
// } from "chartjs-chart-geo";
import {
  Chart,
  CategoryScale,
  LineController,
  LineElement,
  BarController,
  BarElement,
  ArcElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "chartjs-adapter-moment";
import { REMEMBER_PASSWORD } from "./constants/constants";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  BarController,
  BarElement,
  ArcElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title
  // ChoroplethController,
  // GeoFeature,
  // ColorScale,
  // ProjectionScale
);

// Don't use queryClient directly
// https://stackoverflow.com/questions/68577988/invalidate-queries-doesnt-work-react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Hiện ko hoạt động? => Check ChatGPT => custom hook
      retry: false,
    },
  },
});

const AppComp = () => {
  useEffect(() => {
    // https://dev.to/eons/detect-page-refresh-tab-close-and-route-change-with-react-router-v5-3pd
    // https://bobbyhadz.com/blog/react-handle-tab-close-event

    const handleTabClose = (event) => {
      const isRemember = localStorage.getItem(REMEMBER_PASSWORD);
      if (isRemember !== "true") {
        localStorage.clear(); // logout
      }
      // event.preventDefault();
      // return (event.returnValue = "Are you sure you want to exit?");
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  return <AppRoutes />;
};

function App() {
  const location = useLocation();
  let persistor = persistStore(store);

  useEffect(() => {
    // @ts-ignore
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    // @ts-ignore
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  useEffect(() => {
    const listVersion = Object.keys(migrations);
    const lastestVersion = listVersion[listVersion.length - 1];

    try {
      const storageData = localStorage.getItem("persist:root") || "";
      const persistData = JSON.parse(storageData)?._persist || "{}";
      const oldPersistVer = JSON.parse(persistData)?.version;

      if (lastestVersion !== oldPersistVer) {
        localStorage.setItem("persist:root", "{}");
      }
    } catch (error) {
      console.log("Storage data conversion error :>> ", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppComp />
          <ToastContainer autoClose={3500} hideProgressBar />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
