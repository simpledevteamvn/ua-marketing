import Button from "antd/lib/button/button";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import SelectCountry from "../../../../../partials/common/Forms/SelectCountry";

function ModalEditCountries({
  isOpen,
  onClose,
  initedData,
  setIsLoading,
  callback,
}) {
  const [countries, setCountries] = useState([]);

  const onCloseModal = () => {
    onClose();
  };

  const onSubmit = () => {
    const params = {
      adGroupId: initedData.id,
      geos: countries.join(","),
    };

    setIsLoading(true);
    service.put("/adgroup", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseModal();
        callback(res.results);
      },
      () => setIsLoading(false)
    );
  };

  useEffect(() => {
    if (isOpen) {
      setCountries(initedData.countries);
    }
  }, [isOpen]);

  return (
    <Modal
      title="Edit countries"
      width={400}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Save
        </Button>,
      ]}
    >
      <SelectCountry value={countries} onChange={setCountries} />
    </Modal>
  );
}

export default ModalEditCountries;
