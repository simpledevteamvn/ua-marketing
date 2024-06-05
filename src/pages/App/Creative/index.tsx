import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Tabs from "antd/lib/tabs";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import CreativePack from "./CreativePack/CreativePack";
import Creative from "./Creative";

const CreativeIds = {
  creative: "1",
  creativePack: "2",
};

const CreativeTabs = [
  { id: "0", name: "Creatives", tabUrl: CreativeIds.creative },
  { id: "1", name: "Creative Packs", tabUrl: CreativeIds.creativePack },
];

function CreativePage(props) {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [tab, setTab] = useState<any>();
  const [items, setItems] = useState<any>([]);

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    const activedTab = CreativeTabs.find((tabObj) => tabObj.tabUrl === tabUrl);

    !items.length &&
      setItems(
        CreativeTabs.map((tab) => {
          return {
            key: tab.tabUrl,
            label: tab.name,
            children: (
              <div className="p-4 sm:p-6">{getTabComponent(tab.tabUrl)}</div>
            ),
          };
        })
      );

    if (activedTab?.tabUrl === tab) return;
    setTab(activedTab?.tabUrl || CreativeTabs[0].tabUrl);
  }, [window.location.search]);

  const onChangeTab = (tabUrl) => {
    if (tab === tabUrl) return;

    navigate({
      search: createSearchParams({ tab: tabUrl }).toString(),
    });
  };

  const getTabComponent = (tabUrl) => {
    switch (tabUrl) {
      case CreativeIds.creative:
        return <Creative />;

      case CreativeIds.creativePack:
      default:
        return <CreativePack />;
    }
  };

  return (
    <Page>
      <Tabs type="card" items={items} activeKey={tab} onChange={onChangeTab} />
    </Page>
  );
}

export default CreativePage;
