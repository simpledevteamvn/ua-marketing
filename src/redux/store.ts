import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMigrate, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import { useDispatch } from "react-redux";

// import appSlice from "./app/appSlice";
import sidebarSlice from "./sidebar/sidebarSlice";
import userSlice from "./account/accountSlice";
import connectorSlice from "./connector/connectorSlice";
import socketSlice from "./socket/socketSlice";
import notificationSlice from "./socket/notificationSlice";

export const migrations = {
  0: () => {},
  1: (state) => {
    return {
      ...state,
      app: {
        ...state.app,
        applications: [...state.app.networkApps],
      },
    };
  },
  2: (state) => {
    return {
      ...state,
      app: undefined,
    };
  },
  3: (state) => {
    return { ...state, socket: { reportTable: [] } };
  },
  4: (state) => {
    return { ...state, notification: { totalNotifications: 0 } };
  },
  5: (state) => {
    return {
      ...state,
      account: {
        ...state.account,
        userData: {
          ...state.account.userData,
          organization: { code: "" },
          organisation: undefined,
        },
      },
    };
  },
};

const listVersion = Object.keys(migrations);
const lastestVersion = listVersion[listVersion.length - 1];

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  timeout: 200,
  // https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md
  // https://github.com/rt2zz/redux-persist/issues/1206
  version: Number(lastestVersion),
  // @ts-ignore
  migrate: createMigrate(migrations, { debug: true }),
};

const appReducer = combineReducers({
  account: userSlice,
  connector: connectorSlice,
  sidebar: sidebarSlice,
  socket: socketSlice,
  // app: appSlice,
  notification: notificationSlice,
});

/**
 * Reset all states of redux-persist to initialStates
 * Ref: https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
 */
const rootReducer = (state, action) => {
  if (action.type === "account/logout") {
    localStorage.removeItem("persist:root");
    localStorage.clear();
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

// Ref: https://redux-toolkit.js.org/usage/usage-with-typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Ref: https://stackoverflow.com/questions/67453258/why-do-i-need-to-do-export-const-useappdispatch-usedispatchappdispatch
export const useAppDispatch: () => AppDispatch = useDispatch;
export default store;
