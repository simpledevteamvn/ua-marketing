import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Page from "../../../utils/composables/Page";
import DatePicker from "antd/lib/date-picker";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../partials/common/Forms/RangePicker";
import { EXTRA_FOOTER } from "../../../constants/constants";
import Tag from "antd/lib/tag";
import { LIST_AD_NETWORK, LIST_EMAIL } from "../../../api/constants.api";
import { useQuery } from "@tanstack/react-query";
import { getListAdNetwork } from "../../../api/common/common.api";
import Button from "antd/lib/button/button";
import HistoryTable from "./HistoryTable";
import service from "../../../partials/services/axios.config";
import moment from "moment";
import {
  CSV_HISTORY_OPTIONS,
  LIST_FILTER_KEY,
} from "../../../constants/dropdowns";
import TableDynamicFilter, {
  DynamicFilter,
  getTableFilter,
} from "../../../partials/common/Table/TableDynamicFilter";
import { getUserByApp } from "../../../api/campaign-center/campaign-center.api";
import { disabledDate } from "../../../utils/Helpers";

function History(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  const [csvHistory, setCsvHistory] = useState<any>();

  const defaultDimension: DynamicFilter = {
    activedDimension: undefined,
    dimensionOpts: CSV_HISTORY_OPTIONS,
    filterOpts: [],
    activedFilters: [],
    filterValue: "",
    filterLabel: "",
  };
  const [dimensionFilters, setDimensionFilters] = useState<DynamicFilter[]>([
    defaultDimension,
  ]);
  const [listUser, setListUser] = useState([]);

  // Filters in BE
  const defaultPageSize = 20;
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });

  const { data: listNetwork, isLoading: isLoadingNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results || []);
  }, [listNetwork]);

  const { data: listUserByApp } = useQuery({
    queryKey: [LIST_EMAIL, { storeAppId: "" }],
    queryFn: getUserByApp,
    staleTime: 30 * 60000,
  });

  useEffect(() => {
    setListUser(listUserByApp?.results || []);
  }, [listUserByApp]);

  useEffect(() => {
    onSearchData();
  }, [tableFilters]);

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;

    if (pageSize !== tableFilters.size || current - 1 !== tableFilters.page) {
      setTableFilters({ size: pageSize, page: current - 1 });
    }
  };

  const onSearchData = () => {
    const params = {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      page: tableFilters.page,
      size: tableFilters.size,
      networks: getTableFilter(dimensionFilters, LIST_FILTER_KEY.adNetwork),
      emails: getTableFilter(dimensionFilters, LIST_FILTER_KEY.email),
    };

    setIsLoading(true);
    service.get("/history/bid/file", { params }).then(
      (res: any) => {
        const content = res.results?.content;
        let newData = res.results;
        if (content?.length) {
          const newContent = content.map((historyData: any, idx) => {
            if (!historyData.histories?.length) {
              return historyData;
            }

            const newHistories = historyData.histories.map((el, detailId) => {
              return { ...el, tableId: idx + "," + detailId };
            });
            return { ...historyData, histories: [...newHistories] };
          });
          newData = { ...newData, content: [...newContent] };
        }

        setCsvHistory(newData);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Page>
      <div className="grid grid-cols-12 gap-2">
        <div className="form-filter-left">Date Range</div>
        <div className="form-filter-right">
          <DatePicker.RangePicker
            open={isOpenDateRange}
            onOpenChange={(open) => setIsOpenDateRange(open)}
            value={dateRange}
            onChange={setDateRange}
            disabledDate={disabledDate}
            renderExtraFooter={() => (
              <div className="flex py-2.5">
                {EXTRA_FOOTER.map((obj, idx) => (
                  <Tag
                    key={idx}
                    color="blue"
                    className="cursor-pointer"
                    onClick={() =>
                      onClickRangePickerFooter(obj.value, setDateRange, () =>
                        setIsOpenDateRange(false)
                      )
                    }
                  >
                    {obj.label}
                  </Tag>
                ))}
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-5">
        <TableDynamicFilter
          dimensionOpts={CSV_HISTORY_OPTIONS}
          listAdNetwork={listAdNetwork}
          listUser={listUser}
          defaultDimension={defaultDimension}
          dimensionFilters={dimensionFilters}
          setDimensionFilters={setDimensionFilters}
        />
      </div>

      <Button type="primary" className="mt-5 md:mt-4" onClick={onSearchData}>
        Search
      </Button>

      <HistoryTable
        isLoading={isLoading || isLoadingNetwork}
        listData={csvHistory?.content || []}
        tableFilters={tableFilters}
        total={csvHistory?.totalElements}
        onChange={onChange}
        updateTableData={setCsvHistory}
      />
    </Page>
  );
}

History.propTypes = {};

export default History;
