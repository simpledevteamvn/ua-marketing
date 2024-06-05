import React, { useEffect, useState } from "react";
import {
  DEFAULT_BID_STEP,
  NOT_A_NUMBER,
} from "../../../../../constants/constants";
import InputNumber from "antd/lib/input-number";
import Button from "antd/lib/button";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";

export default function EditableField({
  title = "Default bid",
  fieldName = "bid",
  isNA = false,
  editable = true,
  step = DEFAULT_BID_STEP,
  defaultValue,
  valueWithCurrency,
  onSave,
}) {
  const [isEdit, setIsEdit] = useState(false);
  const [newValue, setNewValue] = useState<any>();

  useEffect(() => {
    setNewValue(defaultValue);
  }, [defaultValue]);

  const onSubmitEdit = () => {
    setIsEdit(false);
    onSave(newValue, fieldName);
  };

  const onCancel = () => {
    setIsEdit(false);
    setNewValue(defaultValue);
  };

  return (
    <div className="flex items-center justify-end border-t px-5 py-3">
      <div className="basis-1/3 text-black">{title}</div>

      <div className="basis-2/3 flex justify-between min-h-[25px]">
        <div className="text-red-700 font-semibold">
          {isNA ? (
            <span>{NOT_A_NUMBER}</span>
          ) : (
            <>
              {isEdit ? (
                <InputNumber
                  className="!w-44"
                  min={0}
                  autoFocus
                  step={step}
                  value={newValue}
                  onChange={setNewValue}
                />
              ) : (
                valueWithCurrency
              )}
            </>
          )}
        </div>

        <div className="w-28 flex justify-end">
          {!isNA && isEdit && (
            <div className="flex space-x-2">
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={onSubmitEdit}>
                Save
              </Button>
            </div>
          )}
          {editable && !isNA && !isEdit && (
            <AiOutlineEdit
              size={20}
              className="shrink-0 text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => setIsEdit(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
