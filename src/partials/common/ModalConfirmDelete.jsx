import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../elements/Modal";
import Input from "../elements/Input";

function ModalConfirmDelete(props) {
  const { title, isOpen, onClose, onSubmit, targetName } = props;
  const [objName, setObjName] = useState("");

  return (
    <Modal
      title={title}
      submitLabel="Delete"
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setTimeout(() => {
          setObjName("");
        }, 300);
      }}
      onSubmit={() => {
        setObjName("");
        onSubmit();
      }}
      disabled={objName !== targetName}
      submitProps={{ danger: true }}
    >
      <div className="text-gray-900">
        Please enter exactly the text (
        <span className="font-bold whitespace-pre-wrap">{targetName}</span>) to
        confirm.
      </div>
      <Input
        noteRequire
        className="mt-3"
        value={objName}
        onChange={(value) => setObjName(value)}
        placeholder="Enter name"
        inputClassName="input-light-antd"
      />
    </Modal>
  );
}

ModalConfirmDelete.defaultProps = {
  title: "Confirm Delete",
  targetName: "",
};

ModalConfirmDelete.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  targetName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
};

export default ModalConfirmDelete;
