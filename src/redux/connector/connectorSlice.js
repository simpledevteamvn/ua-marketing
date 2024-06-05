import { createSlice } from "@reduxjs/toolkit";

export const connectorSlice = createSlice({
  name: "connector",
  initialState: {
    newConfig: {},
  },
  reducers: {
    addConnector: (state, { payload }) => {
      state.newConfig = payload;
    },
  },
});

export const { addConnector } = connectorSlice.actions;

export default connectorSlice.reducer;
