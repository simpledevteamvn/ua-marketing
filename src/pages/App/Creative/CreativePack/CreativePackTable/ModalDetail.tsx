import React, { useState } from "react";
import Modal from "antd/lib/modal/Modal";
import Button from "antd/lib/button/button";
import CreativeTable from "./CreativeTable";

function ModalDetail({
  isOpen,
  onClose,
  rd,
  setPreviewData,
  setImgPreview,
  // listData,
}) {
  // const defaultDetailFilters = {
  //   page: 0,
  //   size: 10,
  // };
  // const [filters, setFilters] = useState<any>({});

  const onCloseModal = () => {
    onClose();
  };

  // const onChangeCreative = (recordIdx, pagination) => {
  //   const { pageSize, current } = pagination;
  //   setFilters({
  //     ...filters,
  //     [recordIdx]: { size: pageSize, page: current - 1 },
  //   });
  // };

  // const idx = listData?.findIndex(
  //   (el) => el.id === rd.id
  // );

  const data = rd.creatives?.length ? rd.creatives : rd.assets || [];

  return (
    <Modal
      title={`View "${rd.name}" pack`}
      width={1100}
      open={isOpen}
      destroyOnClose
      onCancel={onCloseModal}
      footer={[
        <Button
          key="back"
          type="primary"
          htmlType="button"
          onClick={onCloseModal}
        >
          Close
        </Button>,
      ]}
    >
      <CreativeTable
        data={data}
        // tableFilters={filters[idx] || defaultDetailFilters}
        // recordIdx={idx}
        // onChange={onChangeCreative}
        setPreviewData={setPreviewData}
        setImgPreview={setImgPreview}
      />
    </Modal>
  );
}

export default ModalDetail;
