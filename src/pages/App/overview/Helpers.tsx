import message from "antd/lib/message";
import service from "../../../partials/services/axios.config";
import { MESSAGE_DURATION } from "../../../constants/constants";

export const saveTemplate = (props) => {
  const {
    name = "",
    isDefault = false,
    editData = {},
    callback = () => {},
    isGetNewState = false,

    getTemplateState,
    isSkanPage,
    setListTemplate,
    listTemplate,
    setActivedTemplate,
    activedTemplate,
  } = props;

  const defaultStatus = isDefault === null ? editData?.isDefault : isDefault;

  let params;
  if (editData?.id) {
    if (isGetNewState) {
      // Update new changed template state
      params = {
        ...editData,
        ...getTemplateState(),
      };
    } else {
      // Update name or default status of the exist template
      params = {
        ...editData,
        name: name || editData.name,
        isDefault: defaultStatus,
      };
    }
  } else {
    // Add new template
    params = {
      name,
      isDefault: defaultStatus,
      ...getTemplateState(),
    };
  }
  params.isSKAN = isSkanPage;

  service.post("/dashboard-customize", params).then(
    (res: any) => {
      callback && callback();
      if (!editData.id) {
        setListTemplate([res.results, ...listTemplate]);
        setActivedTemplate(0);
      } else {
        const newListTemplate = listTemplate;
        newListTemplate.splice(activedTemplate, 1, res.results);
        setListTemplate(newListTemplate);
      }

      message.success(
        "You changes have been successfully saved!",
        MESSAGE_DURATION
      );
    },
    () => {}
  );
};
