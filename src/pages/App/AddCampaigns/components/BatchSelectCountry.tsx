import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal/Modal";
import Button from "antd/lib/button";
import AntInput from "antd/lib/input";
import CountriesList from "countries-list";

function BatchSelectCountry(props) {
  const { isOpen, onClose, onBatchCountry } = props;

  const [value, setValue] = useState<string>();
  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setValue("");
    }, 300);
  };

  const onAdd = () => {
    const listText = value!.replace(/ /g, "").split("\n");
    let countries: string[] = [];

    listText.forEach((el) => {
      const newList = el.split(",").map((el) => el.toUpperCase());
      countries = [...countries, ...newList];
    });

    const supportedCodes = Object.keys(CountriesList.countries);
    const countryCodes = countries.filter((el) => supportedCodes.includes(el));

    onBatchCountry(countryCodes);
    onCloseModal();
  };

  return (
    <Modal
      title="Add Location in Bulk"
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onAdd} disabled={!value}>
          Add
        </Button>,
      ]}
    >
      <div className="font-semibold mb-2">Country:</div>
      <AntInput.TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Example: vn,us"
      />
      <div className="mt-1.5">
        Type or paste your locations above. You can put each location on a new
        line or separate them using commas.
      </div>
    </Modal>
  );
}

BatchSelectCountry.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onBatchCountry: PropTypes.func,
};

export default BatchSelectCountry;
