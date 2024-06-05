import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Popover from "antd/lib/popover";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineStar } from "@react-icons/all-files/ai/AiOutlineStar";
import { AiOutlineSave } from "@react-icons/all-files/ai/AiOutlineSave";
import { AiFillStar } from "@react-icons/all-files/ai/AiFillStar";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import { AiOutlineDelete } from "@react-icons/all-files/ai/AiOutlineDelete";
import Input from "antd/lib/input";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import classNames from "classnames";
// @ts-ignore
import logo from "../../../images/logo/logo.svg";
import moment from "moment/moment";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { saveTemplate } from "./Helpers";

function SelectTemplate(props) {
  const inputRef = useRef<any>(null);
  const inputAddTemplateRef = useRef<any>(null);

  const {
    open,
    isAddNew,
    listTemplate,
    setIsAddNew,
    onOpenChange,
    setListTemplate,
    getTemplateState,
    setIsLoading,
    activedTemplate,
    setActivedTemplate,
    isSkanPage,
  } = props;

  const [isDefault, setIsDefault] = useState(false);
  const [isEditName, setIsEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAddNewTemplate, setIsAddNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const handleClose = (value = false) => {
    onOpenChange && onOpenChange(value);
    resetInput();
  };

  const resetInput = () => {
    setTimeout(() => {
      setIsEditName(false);
      setIsAddNewTemplate(false);
      setNewTemplateName("");
      isAddNew && setIsAddNew(false);
    }, 300);
  };

  useEffect(() => {
    if (isAddNew) {
      addNewTemplate();
    }
  }, [isAddNew]);

  useEffect(() => {
    const newDefaultStatus = listTemplate[activedTemplate]?.isDefault;
    if (newDefaultStatus !== isDefault) {
      setIsDefault(newDefaultStatus);
    }
  }, [activedTemplate]);

  const onDeleteTemplate = () => {
    const id = listTemplate[activedTemplate].id;

    setIsLoading(true);
    service.delete("/dashboard-customize", { params: { id } }).then(
      (res: any) => {
        const newListTemplates = listTemplate.filter(
          (el, idx) => activedTemplate !== idx
        );

        setListTemplate(newListTemplates);
        setActivedTemplate(0);
        toast(res.message, { type: "success" });
        setIsLoading(false);
        handleClose();
      },
      () => setIsLoading(false)
    );
  };

  const setDefaultTemplate = () => {
    setIsDefault(true);
    onSaveTemplate("", true, listTemplate[activedTemplate]);
  };

  const cancelDefaultTemplate = () => {
    setIsDefault(false);
    onSaveTemplate("", false, listTemplate[activedTemplate]);
  };

  const onEnableEditName = () => {
    setIsEditName(true);
    setNewName(listTemplate[activedTemplate]?.name);
    setTimeout(() => {
      inputRef.current?.select();
    }, 200);
  };

  const onSaveNewName = () => {
    const callback = () => {
      setIsEditName(false);
      resetInput();
    };
    onSaveTemplate(newName, null, listTemplate[activedTemplate], callback);
  };

  const onSaveChanges = () => {
    onSaveTemplate("", null, listTemplate[activedTemplate], () => {}, true);
  };

  const onSaveTemplate = (
    name = "",
    isDefault: Boolean | null = false,
    editData: any = {},
    callback = () => {},
    isGetNewState = false
  ) => {
    saveTemplate({
      name,
      isDefault,
      editData,
      callback,
      isGetNewState,

      getTemplateState,
      isSkanPage,
      setListTemplate,
      listTemplate,
      setActivedTemplate,
      activedTemplate,
    });
  };

  const useTemplate = (idx) => {
    handleClose();
    setActivedTemplate(idx);
  };

  const onAddTemplate = () => {
    const callback = () => {
      setIsAddNewTemplate(false);
      resetInput();
    };
    onSaveTemplate(newTemplateName, false, {}, callback);
  };

  const addNewTemplate = () => {
    setIsAddNewTemplate(true);
    setTimeout(() => {
      inputAddTemplateRef.current?.focus({ cursor: "end" });
    }, 200);
  };

  const cancelAddTemplate = () => {
    setIsAddNewTemplate(false);
    resetInput();
  };

  const cancelBtn =
    "text-antPrimary hover:bg-slate-200/40 px-2 rounded-sm cursor-pointer transition-all ease-in duration-100";
  const isDefaultTemplate = listTemplate[activedTemplate]?.title;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      getPopupContainer={() => document.getElementById("SelectTemplateId")!}
      open={open}
      onOpenChange={handleClose}
      title={
        <div className="flex items-center justify-between text-sm !font-normal py-3">
          {isEditName ? (
            <Input
              ref={inputRef}
              className="!p-0"
              bordered={false}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          ) : (
            <div>{listTemplate[activedTemplate]?.name}</div>
          )}

          {isEditName ? (
            <div className="flex space-x-1.5">
              <div className={cancelBtn} onClick={() => setIsEditName(false)}>
                Cancel
              </div>
              <div
                className="text-white bg-antPrimary hover:bg-antPrimary/90 px-1.5 rounded-sm cursor-pointer"
                onClick={onSaveNewName}
              >
                Save
              </div>
            </div>
          ) : (
            <div className="flex space-x-2.5">
              {!isDefaultTemplate && (
                <Tooltip
                  title="Delete template"
                  color="white"
                  overlayClassName="tooltip-light"
                >
                  <AiOutlineDelete
                    size={18}
                    className="text-slate-600 hover:text-antPrimary cursor-pointer"
                    onClick={onDeleteTemplate}
                  />
                </Tooltip>
              )}
              <Tooltip
                title="Set default"
                color="white"
                overlayClassName="tooltip-light"
              >
                {isDefault ? (
                  <AiFillStar
                    className="text-antPrimary hover:text-antPrimary/90 cursor-pointer"
                    size={19}
                    onClick={cancelDefaultTemplate}
                  />
                ) : (
                  <AiOutlineStar
                    className="text-slate-600 hover:text-antPrimary cursor-pointer"
                    size={19}
                    onClick={setDefaultTemplate}
                  />
                )}
              </Tooltip>
              {!isDefaultTemplate && (
                <>
                  <Tooltip
                    title="Edit template"
                    color="white"
                    overlayClassName="tooltip-light"
                  >
                    <AiOutlineEdit
                      size={18}
                      className="text-slate-600 hover:text-antPrimary cursor-pointer"
                      onClick={onEnableEditName}
                    />
                  </Tooltip>
                  <Tooltip
                    title="Save changes"
                    color="white"
                    overlayClassName="tooltip-light"
                  >
                    <AiOutlineSave
                      size={18}
                      className="text-slate-600 hover:text-antPrimary cursor-pointer"
                      onClick={onSaveChanges}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>
      }
      content={
        <div className="popover-without-arrow popover-custom-border popover-custom-height popover-custom-zIndex -mx-4 -mb-3 w-80 sm:w-[500px]">
          <div className="flex items-center justify-between mb-3 px-4">
            {isAddNewTemplate ? (
              <Input
                placeholder="Name of the template"
                ref={inputAddTemplateRef}
                className="!px-0"
                bordered={false}
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            ) : (
              <div className="inline-block">
                <div
                  className="flex items-center cursor-pointer hover:bg-slate-200/70 rounded px-2 py-1 transition-all ease-in duration-100"
                  onClick={addNewTemplate}
                >
                  <PlusOutlined className="text-xs2 mr-1 mb-0.5" />
                  Save new template
                </div>
              </div>
            )}

            {isAddNewTemplate && (
              <div className="flex space-x-1.5">
                <div className={cancelBtn} onClick={cancelAddTemplate}>
                  Cancel
                </div>
                <div
                  className={classNames(
                    "text-white bg-antPrimary px-1.5 rounded-sm cursor-pointer",
                    !newTemplateName?.length
                      ? "bg-antPrimary/40 cursor-not-allowed"
                      : "hover:bg-antPrimary/90"
                  )}
                  onClick={onAddTemplate}
                >
                  Save
                </div>
              </div>
            )}
          </div>

          {listTemplate.length > 0 &&
            listTemplate.map((temp, idx) => {
              const isTemplateDefault = temp.title;

              return (
                <div key={idx}>
                  <div
                    className={classNames(
                      "flex justify-between items-center space-x-2 cursor-pointer px-4 py-2",
                      activedTemplate === idx
                        ? "bg-blue-50/80"
                        : "hover:bg-slate-200/40"
                    )}
                    onClick={() => useTemplate(idx)}
                  >
                    <div>
                      <div className="flex items-center space-x-1 font-semibold">
                        <div>{temp.name}</div>
                        {temp.isDefault && (
                          <AiFillStar
                            className="text-antPrimary cursor-pointer mb-0.5"
                            size={14}
                          />
                        )}
                      </div>
                      <div
                        className={classNames(
                          "text-sm opacity-80",
                          !isTemplateDefault && "text-xs2"
                        )}
                      >
                        {isTemplateDefault
                          ? isTemplateDefault
                          : moment(temp.createdDate).format("MMM DD, YYYY")}
                      </div>
                    </div>
                    {isTemplateDefault && (
                      <img
                        src={logo}
                        alt=" "
                        className="w-6 h-6"
                        title="Default template"
                      />
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      }
    />
  );
}

SelectTemplate.propTypes = {
  open: PropTypes.bool,
  isSkanPage: PropTypes.bool,
  isAddNew: PropTypes.bool,
  listTemplate: PropTypes.array,
  setIsAddNew: PropTypes.func,
  onOpenChange: PropTypes.func,
  setListTemplate: PropTypes.func,
  getTemplateState: PropTypes.func,
  setIsLoading: PropTypes.func,
  activedTemplate: PropTypes.number,
  setActivedTemplate: PropTypes.func,
};

export default SelectTemplate;
