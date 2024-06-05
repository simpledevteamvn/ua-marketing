import React, { useState } from "react";
import PropTypes from "prop-types";
import InputNumber from "antd/lib/input-number";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import { MAXIMUM_INC_PERCENTAGE } from "../../../constants/constants";
import AntInput from "antd/lib/input";
import { roundNumber } from "../../../utils/Helpers";

function ModalConfirmValue(props) {
  const {
    title,
    isOpen,
    onClose,
    onSubmit,
    targetValue,
    confirmText,
    confirmOk,
    oldValue,
  } = props;

  const [value, setValue] = useState<string>();
  const [numberValue, setNumberValue] = useState<number | null>();

  const onCloseModal = () => {
    onClose && onClose();
    setTimeout(() => {
      setValue("");
      setNumberValue(null);
    }, 300);
  };

  const onSubmitModal = () => {
    onCloseModal();
    onSubmit && onSubmit();
  };

  let isDisabled;
  let formEl;
  let changedPer;

  if (confirmOk) {
    isDisabled = false;

    if (oldValue && targetValue) {
      const per = Math.abs(1 - targetValue / oldValue) * 100;
      changedPer = roundNumber(per, false, 1);
    }
  } else {
    formEl = (
      <>
        {confirmText ? (
          <AntInput
            allowClear
            className="!w-full"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <InputNumber
            className="!w-full"
            min={0}
            step={1}
            value={numberValue}
            onChange={setNumberValue}
          />
        )}
      </>
    );
    isDisabled = confirmText
      ? value?.toLowerCase() !== String(targetValue)?.toLowerCase()
      : numberValue !== targetValue;
  }

  return (
    <Modal
      width={confirmOk ? 350 : 430}
      title={title}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          disabled={isDisabled}
          onClick={onSubmitModal}
        >
          Confirm
        </Button>,
      ]}
    >
      {confirmOk && oldValue && (
        <div className="text-gray-900">
          The new value is {targetValue}
          <span>{changedPer && ` (${changedPer}% changed)`}</span>. Confirm this
          change?
        </div>
      )}
      {!confirmOk && (
        <>
          <div className="text-gray-900 mb-2">
            Please enter exactly the value (
            <span className="font-bold whitespace-pre">{targetValue}</span>) to
            confirm.
          </div>

          {formEl}
        </>
      )}
    </Modal>
  );
}

ModalConfirmValue.defaultProps = {
  title: "Confirm Value",
  targetValue: "Confirm",
  confirmText: false,
  confirmOk: false,
};

ModalConfirmValue.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  confirmOk: PropTypes.bool,
  targetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  oldValue: PropTypes.number,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  confirmText: PropTypes.bool,
};

export default ModalConfirmValue;
