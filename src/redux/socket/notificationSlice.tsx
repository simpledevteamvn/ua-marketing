import { createSlice } from "@reduxjs/toolkit";

interface NotificationState {
  totalNotifications: number;
}

const initialData: NotificationState = {
  totalNotifications: 0,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState: initialData,
  reducers: {
    updateNotification: (state, { payload }) => {
      const { newValue } = payload;

      if (newValue === 0 || newValue) {
        state.totalNotifications = newValue;
      } else {
        state.totalNotifications += 1;
      }
    },
  },
});

export const { updateNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
