import { Button } from "antd";
import classNames from "classnames";
import React from "react";
import { FIELD_REQUIRED } from "../../../constants/formMessage";

export type ActivedType = number | string;
export interface ButtonGroupData {
  label: string;
  value: ActivedType;
  preventClick?: boolean;
}

interface ButtonGroupProps {
  data: ButtonGroupData[];
  actived: Array<ActivedType>;
  setActived: (any) => any;
  multiple?: boolean;
  btnClass?: string;
}

export default function ButtonGroup({
  data,
  actived = [],
  setActived,
  multiple = false,
  btnClass = "",
}: ButtonGroupProps) {
  const update = (id: any) => {
    if (!multiple) return setActived([id]);

    if (actived.includes(id)) {
      setActived(actived.filter((el) => el !== id));
    } else {
      setActived([...actived, id]);
    }
  };

  return (
    <div className="ButtonGroup flex flex-wrap -mt-1 -mx-0.5">
      {data?.map((el, idx) => {
        const isActived = actived.includes(el.value);

        return (
          <Button
            key={el.value}
            type={isActived ? "primary" : undefined}
            onClick={() => !el.preventClick && update(el.value)}
            className={classNames(
              "min-w-[80px] mt-1 mx-0.5 !text-xs3",
              btnClass
            )}
          >
            {el.label}
          </Button>
        );
      })}
    </div>
  );
}

export const getGroupData = (list: any, field = ""): ButtonGroupData[] => {
  if (!list?.length) return [];

  if (typeof list[0] === "string") {
    return list.map((el) => ({ label: el, value: el }));
  }

  if (field) {
    return list.map((el) => ({ label: el[field], value: el[field] }));
  }

  return [];
};

export const getBtnGroupRule = (
  values: Array<ActivedType>,
  message = FIELD_REQUIRED
) => ({
  required: true,
  message,
  validator: (rule, value, callback) => {
    return new Promise((resolve, reject) => {
      if (values?.length) {
        resolve("");
      }
      reject();
    });
  },
});
