import Badge from "antd/lib/badge";
import React from "react";
import { BiMerge } from "@react-icons/all-files/bi/BiMerge";

export const EmptyPreviewEl = ({ count }) => (
  <Badge color="#fca5a5" size="small" count={count} offset={[-3, 5]}>
    <BiMerge size="34" className="!text-slate-300/50" />
  </Badge>
);
