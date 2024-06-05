import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  id: string;
  icon: string;
  name: string;
  applications: any;
}

const initialData: AppState = {
  id: "",
  icon: "",
  name: "",
  applications: [],
};

export const appSlice = createSlice({
  name: "app",
  initialState: initialData,
  reducers: {
    updateApp: (state, { payload }) => {
      return Object.assign({}, state, payload);
    },
  },
});

export const { updateApp } = appSlice.actions;

export default appSlice.reducer;
