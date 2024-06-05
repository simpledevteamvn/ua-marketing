import { createSlice } from "@reduxjs/toolkit";
import { EDITABLE_STAT_IDS } from "../../constants/constants";

interface ReportTable {
  type: string;
  data: any[];
}

interface SocketState {
  reportTable: ReportTable[];
}

const initialData: SocketState = {
  reportTable: [
    {
      type: EDITABLE_STAT_IDS.bid,
      data: [],
    },
    {
      type: EDITABLE_STAT_IDS.budget,
      data: [],
    },
  ],
};

export const socketSlice = createSlice({
  name: "socket",
  initialState: initialData,
  reducers: {
    updateReportTable: (state, { payload }) => {
      const { data, field } = payload;
      if (!data?.length || !field) return;

      let newReportState;
      if (state.reportTable?.length) {
        newReportState = state.reportTable.map((el) => {
          if (el.type !== field) return el;

          const newData = el.data.length ? [...el.data, ...data] : data;
          return { ...el, data: newData };
        });
      } else {
        newReportState = [{ type: field, data, totalUpdate: data.length }];
      }

      state.reportTable = newReportState;
    },
    resetReportTable: (state, { payload }) => {
      state.reportTable = initialData.reportTable;
    },
  },
});

export const { updateReportTable, resetReportTable } = socketSlice.actions;

export default socketSlice.reducer;
