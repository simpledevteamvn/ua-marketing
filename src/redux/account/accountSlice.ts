import { createSlice } from "@reduxjs/toolkit";

interface Account {
  token: string;
  userData: UserData;
}

interface UserData {
  id: string;
  role: any;
  isAdmin: boolean;
  name: string;
  email: string;
  phone?: string;
  organization: Organization;
  storeApps?: any;
}

interface Organization {
  id: string;
  name: string;
  code: string;
  email: string;
}

const initialData: Account = {
  token: "",
  userData: {
    id: "",
    role: {},
    isAdmin: false,
    name: "",
    email: "",
    organization: {
      id: "",
      name: "",
      code: "",
      email: "",
    },
  },
};

export const accountSlice = createSlice({
  name: "account",
  initialState: initialData,
  reducers: {
    login: (state, { payload }) => {
      state.token = payload;
    },
    updateUser: (state, { payload }) => {
      let newData = payload;
      if (payload.tenant?.id) {
        const { tenant } = payload;
        const { organization, organizationCode } = tenant;

        newData = {
          ...payload,
          organization: {
            ...tenant,
            name: organization,
            code: organizationCode,
          },
          tenant: undefined,
        };
      }
      state.userData = Object.assign({}, state.userData, newData);
    },
    logout: (state) => {
      return initialData;
    },
  },
});

export const { login, updateUser, logout } = accountSlice.actions;

export default accountSlice.reducer;
