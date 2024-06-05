import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Field } from "../Helper";

function Schedule(props) {
  const { data } = props;
  if (!data?.id) return <></>;

  return (
    <div className="mt-4">
      <div className="text-black font-semibold text-lg">Scheduling</div>

      <div className="border bg-white rounded mt-3 text-base flex flex-col">
        <Field
          border={true}
          name="Start date"
          value={
            data.startDate ? moment(data.startDate).format("MMM, D YYYY") : ""
          }
        />
        <Field
          name="End date"
          value={data.endDate ? moment(data.endDate).format("MMM, D YYYY") : ""}
        />
      </div>
    </div>
  );
}

Schedule.propTypes = {
  data: PropTypes.object,
};

export default Schedule;
