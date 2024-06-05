import { createSlice } from "@reduxjs/toolkit";
import { SIDEBAR_EXPANDED } from "../../constants/constants";

interface SideBarState {
  expanded: string | null;
}

const initialData: SideBarState = {
  expanded: localStorage.getItem(SIDEBAR_EXPANDED),
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: initialData,
  reducers: {
    updateExpanded: (state, { payload }) => {
      state.expanded = payload;
    },
  },
});

export const { updateExpanded } = sidebarSlice.actions;

export default sidebarSlice.reducer;
