import { useEffect } from "react";

export default function InfiniteScrollTable({
  listData,
  setTablePage,
  tablePage,
  filteredData,
  PAGE_SIZE,
  tableId,
}) {
  useEffect(() => {
    if (!listData?.length) return;

    // Cách fix chỉ là tạm thời, có thể check thêm ở link bên dưới:
    // https://github.com/ant-design/ant-design/issues/5904
    const tableContent = document.querySelector(`#${tableId} .ant-table-body`);

    if (!tableContent) return;

    const scrollEvent = (event: any) => {
      if (!event?.target) return;

      // checking whether a selector is well defined
      let maxScroll = event.target.scrollHeight - event.target.clientHeight;
      let currentScroll = event.target.scrollTop;
      if (currentScroll === maxScroll) {
        // load more data
        const totalPage = Math.ceil(filteredData?.length / PAGE_SIZE);
        if (tablePage < totalPage - 1) {
          setTablePage(tablePage + 1);
        }
      }
    };

    tableContent.addEventListener("scroll", scrollEvent);
    return () => tableContent.removeEventListener("scroll", scrollEvent);
  }, [listData, filteredData, tablePage]);
}
