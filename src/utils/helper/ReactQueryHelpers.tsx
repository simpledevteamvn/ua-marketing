import { LIST_STORE_APPS, WITH_DETAIL_DATA } from "../../api/constants.api";

export const deletedStoreApp = (queryClient, appId) => {
  queryClient.setQueryData([LIST_STORE_APPS], (oldApps: any) => {
    if (!Array.isArray(oldApps?.results)) return undefined;
    return {
      ...oldApps,
      results: oldApps?.results.filter((el) => el.id !== appId),
    };
  });
  queryClient.setQueryData(
    [LIST_STORE_APPS, WITH_DETAIL_DATA],
    (oldApps: any) => {
      if (!Array.isArray(oldApps?.results)) return undefined;
      return {
        ...oldApps,
        results: oldApps?.results.filter((el) => el.id !== appId),
      };
    }
  );
};

export const addStoreApp = (queryClient, resultsRes) => {
  queryClient.setQueryData([LIST_STORE_APPS], (oldApps: any) => {
    if (!Array.isArray(oldApps?.results)) {
      return { ...oldApps, results: [resultsRes] };
    }
    return { ...oldApps, results: [...oldApps?.results, resultsRes] };
  });
  queryClient.setQueryData(
    [LIST_STORE_APPS, WITH_DETAIL_DATA],
    (oldApps: any) => {
      if (!Array.isArray(oldApps?.results)) {
        return { ...oldApps, results: [resultsRes] };
      }
      return { ...oldApps, results: [...oldApps?.results, resultsRes] };
    }
  );
};
