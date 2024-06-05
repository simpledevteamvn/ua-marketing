import React from "react";
import MinusOutlined from "@ant-design/icons/lib/icons/MinusOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";

const iconClass = "dashed-icon";

export function MinusIcon({ onClick, classNames = "" }) {
  return (
    <MinusOutlined
      className={`${iconClass} ${classNames}`}
      onClick={() => onClick()}
    />
  );
}

export function PlusIcon({ onClick, classNames = "" }) {
  return (
    <PlusOutlined
      className={`${iconClass} ${classNames}`}
      onClick={() => onClick()}
    />
  );
}
