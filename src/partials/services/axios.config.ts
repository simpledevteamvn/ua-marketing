import axios from "axios";
import { toast } from "react-toastify";
import { ORGANIZATION_PATH } from "../../constants/constants";
import store from "../../redux/store";

// @ts-ignore
export const baseURL = import.meta.env.VITE_HOST + "/api/v1";

export const OG_CODE_HEADER = "X-Tenant-ID";
// 408: Lỗi "X-Tenant-ID" không tồn tại
export const LIST_ERROR_CODE = [400, 401, 403, 408, 11111];

const service = axios.create({
  baseURL,
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000, // request timeout
});

service.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = store.getState().account?.token;
    const organizationCode =
      store.getState().account?.userData?.organization?.code;

    if (!config.data?.isNotShowToken && token) {
      config.headers!.Authorization = token;
    }

    const orgCodeFromConfig =
      config.data?.organizationCodeHeader ||
      config.params?.organizationCodeHeader;
    const tenantId = orgCodeFromConfig || organizationCode;
    if (!config.data?.isNotSendOgCode && tenantId) {
      config.headers![OG_CODE_HEADER] = tenantId;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export const checkResponseStatus = (response) => {
  if (response.data.code === 401) {
    toast("Your session has exprired", { type: "error" });
    setTimeout(() => {
      localStorage.clear();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return;
    }, 1500);

    return;
  }

  // Không báo lỗi "X-Tenant-ID" không tồn tại ra màn hình
  if (response.data?.message && response.data.code !== 408) {
    toast(response.data?.message, { type: "error" });
  }

  // App not found -> redirect to ListApps page
  if (response.data.code === 11111) {
    const base_url = window.location.origin;
    const organizationCode =
      store.getState().account?.userData?.organization?.code;
    const appsUrl =
      base_url + ORGANIZATION_PATH + "/" + organizationCode + "/apps";

    setTimeout(() => {
      window.location.href = appsUrl;
      return;
    }, 1500);
  }

  return Promise.reject(new Error(response.data?.message || "Error"));
};

// Add a response interceptor
service.interceptors.response.use(
  function (response) {
    if (LIST_ERROR_CODE.includes(response.data?.code)) {
      return checkResponseStatus(response);
    }
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default service;
