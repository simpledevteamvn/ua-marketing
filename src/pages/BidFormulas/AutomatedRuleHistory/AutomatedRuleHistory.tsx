import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import service from "../../../partials/services/axios.config";

export default function AutomatedRuleHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    // setIsLoading(true);
    // service.get("/automated-rules/search-history").then(
    //   (res) => {
    //     setIsLoading(false);
    //     console.log("res :>> ", res);
    //   },
    //   () => setIsLoading(false)
    // );
  }, []);

  return (
    <Page>
      <div>Coming soon</div>
    </Page>
  );
}
