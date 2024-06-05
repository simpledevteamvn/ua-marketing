import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Form from "antd/lib/form";
import Modal from "antd/lib/modal/Modal";
import Button from "antd/lib/button/button";
import {
  APP_REQUIRED,
  NAME_REQUIRED,
  OPTION_REQUIRED,
} from "../../constants/formMessage";
import AntInput from "antd/lib/input/Input";
import service from "../../partials/services/axios.config";
import Search from "antd/lib/input/Search";
import Tree from "antd/lib/tree/Tree";
import { HTML5Backend } from "react-dnd-html5-backend";
import SelectStoreApp, {
  getActivedApp,
} from "../../partials/common/Forms/SelectStoreApp";
import { ImSigma } from "@react-icons/all-files/im/ImSigma";
import { FaFilter } from "@react-icons/all-files/fa/FaFilter";
import { FaColumns } from "@react-icons/all-files/fa/FaColumns";
import { FaAlignJustify } from "@react-icons/all-files/fa/FaAlignJustify";
import Loading from "../../utils/Loading";
import { DataNode } from "rc-tree/lib/interface";
// import HolderOutlined from "@ant-design/icons/lib/icons/HolderOutlined";
import TreeSelect from "antd/lib/tree-select";
import { DraggableField } from "./components/DraggableField";
import { CALC_TYPES, DroppableArea } from "./components/DroppableArea";
import { useWindowSize } from "../../partials/sidebar/Sidebar";
import { filterTree, getAllParentKeys } from "../../utils/helper/TreeHelpers";
import message from "antd/lib/message";
import { toast } from "react-toastify";
import { getTreeLabel } from "./Helpers";
import { DndProvider } from "react-dnd/dist/core/DndProvider";
import { MESSAGE_DURATION } from "../../constants/constants";

const TEXT_TYPE = "text";

const ConfigIds = {
  filters: "filters",
  columns: "columns",
  rows: "rows",
  values: "values",
};
const ListConfigs = [
  {
    label: "Filters",
    value: ConfigIds.filters,
    minHeight: 100,
    icon: <FaFilter size={15} className="mr-1.5 mb-0.5" />,
  },
  {
    label: "Columns",
    value: ConfigIds.columns,
    minHeight: 100,
    icon: <FaColumns size={16} className="mr-1.5 mb-0.5" />,
  },
  {
    label: "Rows",
    value: ConfigIds.rows,
    minHeight: 100,
    icon: <FaAlignJustify size={15} className="mr-1.5 mb-0.5" />,
  },
  {
    label: "Values",
    value: ConfigIds.values,
    isRequired: true,
    minHeight: 100,
    icon: <ImSigma size={14} className="mr-1.5 mb-0.5" />,
  },
];

interface TreeData extends DataNode {
  titleData?: string;
  children?: any;
}

function ModalAddAndEdit(props) {
  const [form] = Form.useForm();
  const [width] = useWindowSize();
  const {
    isOpen,
    onClose,
    listStoreApps,
    tableData,
    setTableData,
    editedData,
    editCallback,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeData[]>([]);
  const [crrTreeData, setCrrTreeData] = useState<TreeData[]>([]);
  const [activedFields, setActivedFields] = useState<any>({});
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [activedApp, setActivedApp] = useState<string[]>();

  const initialValues = {};

  useEffect(() => {
    if (!isOpen || treeData?.length) return;

    setIsLoading(true);
    service.get("/pivot-table/field").then(
      (res: any) => {
        setIsLoading(false);
        const resData = res.results || {};
        if (!Object.keys(resData)?.length) return;

        const getChildren = (list) => {
          if (Array.isArray(list)) {
            return list.map((field) => {
              return {
                title: (
                  <DraggableField type={TEXT_TYPE} name={getTreeLabel(field)} />
                ),
                // switcherIcon: <HolderOutlined />,
                titleData: getTreeLabel(field),
                key: field,
                value: field,
              };
            });
          }

          if (Object.keys(list)?.length) {
            // List is a object
            return Object.keys(list).map((field) => {
              return {
                title: getTreeLabel(field),
                key: field,
                value: field,
                children: [...getChildren(list[field])],
              };
            });
          }
        };

        const treeData = getChildren(resData);
        setTreeData(treeData);
        setCrrTreeData(treeData);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  useEffect(() => {
    if (!width) return;

    const checkMobile = width < 640;
    if (isMobile !== checkMobile) {
      setIsMobile(checkMobile);
    }
  }, [width]);

  const handleDrop = (item, field, isValues = false) => {
    if (!item.name) return;

    const { name } = item;
    let newData;
    let additionalUpdate: any = null;

    if (isValues) {
      if (!activedFields[field]?.length) {
        newData = [{ name, function: CALC_TYPES.sum }];
      } else {
        const isExist = activedFields[field].some((el) => el.name === name);
        if (!isExist) {
          newData = [
            ...activedFields[field],
            { name, function: CALC_TYPES.sum },
          ];
        }
      }
    } else {
      if (!activedFields[field]?.length) {
        newData = [name];
      } else if (!activedFields[field].includes(name)) {
        newData = [...activedFields[field], name];
      } else {
        newData = activedFields[field];
      }

      // Columns and Rows cannot have the same value
      if (field === ConfigIds.columns) {
        const isExist = activedFields[ConfigIds.rows]?.includes(name);

        if (isExist) {
          const newRows = activedFields[ConfigIds.rows].filter(
            (el) => el !== name
          );
          additionalUpdate = { [ConfigIds.rows]: newRows };
        }
      } else if (field === ConfigIds.rows) {
        const isExist = activedFields[ConfigIds.columns]?.includes(name);

        if (isExist) {
          const newCols = activedFields[ConfigIds.columns].filter(
            (el) => el !== name
          );
          additionalUpdate = { [ConfigIds.columns]: newCols };
        }
      }
    }

    // isValues = true + isExist = true => data ko đổi nên ko làm gì cả
    if (!newData) return;

    if (!additionalUpdate) {
      return setActivedFields({ ...activedFields, [field]: newData });
    }
    setActivedFields({
      ...activedFields,
      ...additionalUpdate,
      [field]: newData,
    });
  };

  const handleDragEnd = (newData, field) => {
    setActivedFields({ ...activedFields, [field]: newData });
  };

  const onRemoveFilter = (idx, text, field) => {
    const newData = [...activedFields[field]];
    newData.splice(idx, 1);
    setActivedFields({ ...activedFields, [field]: newData });
  };

  const onCloseModal = (reset = true) => {
    onClose();

    if (reset) {
      setTimeout(() => {
        form.resetFields();
        setCrrTreeData(treeData);
        setActivedFields({});
        setSearch("");
        setActivedApp([]);
      }, 300);
    }
  };

  useEffect(() => {
    if (!editedData?.id) return;

    const { name, storeAppIds, filters, columns, rows, values } = editedData;
    const listApps = listStoreApps.filter(
      (el) => storeAppIds?.length && storeAppIds.includes(el.id)
    );
    const activedApps = listApps.map((el) => el.storeId + el.name);

    setActivedApp(activedApps);
    form.setFieldsValue({ name, apps: activedApps });

    const newActivedFields = {
      filters: getSelectedLabel(filters),
      columns: getSelectedLabel(columns),
      rows: getSelectedLabel(rows),
      values: getSelectedLabel(values, true),
    };
    setActivedFields(newActivedFields);
  }, [editedData, treeData]);

  const onChangeSearch = (e) => {
    const { value } = e.target;
    const newTreeData = filterTree(treeData, value);
    const listKeys = getAllParentKeys(newTreeData);

    value && setExpandedKeys(listKeys);
    setCrrTreeData(newTreeData);
    setSearch(value);
  };

  const getSelectedKeys = (field = "") => {
    if (!field || !activedFields || !activedFields?.[field]?.length) return [];

    let listFields = activedFields[field];
    const results: any = listFields.map(() => "");

    const loopFunc = (data) => {
      const text = data.titleData || data.title;

      if (field === ConfigIds.values) {
        const index = listFields.findIndex((el) => el.name === text);

        if (index > -1) {
          results[index] = {
            name: data.key,
            function: listFields[index].function,
          };
        }
      } else {
        const index = listFields.findIndex((el) => el === text);

        if (index > -1) {
          results[index] = data.key;
        }
      }

      if (data.children?.length) {
        data.children.forEach((childEl) => {
          loopFunc(childEl);
        });
      }
    };

    treeData.forEach((el) => loopFunc(el));

    return results;
  };

  const getSelectedLabel = (listKeys, isValues = false) => {
    if (!listKeys?.length) return [];

    const results: any = listKeys.map((el) => "");

    const loopFunc = (data) => {
      const text = data.key;
      const label = data.titleData || data.title;
      if (isValues) {
        const activedEl = listKeys.find((el) => el.name === text);
        const index = listKeys.findIndex((el) => el.name === text);

        if (index > -1) {
          results[index] = { name: label, function: activedEl.function };
        }
      } else {
        const index = listKeys.findIndex((el) => el === text);

        if (index > -1) {
          results[index] = label;
        }
      }

      if (data.children?.length) {
        data.children.forEach((childEl) => {
          loopFunc(childEl);
        });
      }
    };

    treeData.forEach((el) => loopFunc(el));

    return results;
  };

  const onClickName = (field) => {
    if (expandedKeys.includes(field)) {
      const newExpandedKeys = expandedKeys.filter((el) => el !== field);
      setExpandedKeys(newExpandedKeys);
    } else {
      setExpandedKeys([...expandedKeys, field]);
    }
  };

  const onChangeFunc = (key, idx) => {
    const newValues = activedFields[ConfigIds.values];
    newValues[idx].function = key;

    setActivedFields({ ...activedFields, [ConfigIds.values]: newValues });
  };

  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys);
  };

  const onFinish = (values) => {
    const { name, apps } = values;
    const listFilters = getSelectedKeys(ConfigIds.filters);
    const listColumns = getSelectedKeys(ConfigIds.columns);
    const listRows = getSelectedKeys(ConfigIds.rows);
    const listValues = getSelectedKeys(ConfigIds.values);

    if (!isMobile && !listValues.length) {
      return message.error("The values field is required.", MESSAGE_DURATION);
    }

    const storeApps = apps?.map((str) => getActivedApp(listStoreApps, str));
    const filters = isMobile ? values[ConfigIds.filters] : listFilters;
    const columns = isMobile ? values[ConfigIds.columns] : listColumns;
    const rows = isMobile ? values[ConfigIds.rows] : listRows;
    const valuesData = isMobile ? values[ConfigIds.values] : listValues;

    const params: any = {
      name,
      storeAppIds: storeApps.map((el) => el.id),
      filters,
      columns,
      rows,
      values: valuesData,
    };

    setIsLoading(true);

    if (editedData?.id) {
      params.id = editedData?.id;
      return service.put("/pivot-table", params).then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });

          if (!res.results || !setTableData) {
            // DetailPivot page -> don't reset field
            onCloseModal(false);
            return editCallback && editCallback(res.results);
          }

          const index = tableData.findIndex((el) => el.id === res.results.id);
          if (index > -1) {
            const newData = tableData;
            newData.splice(index, 1, res.results);

            setTableData(newData);
          }
          onCloseModal();
        },
        () => setIsLoading(false)
      );
    }

    service.post("/pivot-table", params).then(
      (res: any) => {
        setIsLoading(false);
        onCloseModal();

        if (!res.results || !setTableData) return;

        const newData = tableData.length
          ? [res.results, ...tableData]
          : [res.results];

        setTableData(newData);
        toast(res.message, { type: "success" });
      },
      () => setIsLoading(false)
    );
  };

  const handleCloseModal = () => {
    if (!setTableData) {
      // DetailPivot page -> don't reset field
      onCloseModal(false);
    } else {
      onCloseModal();
    }
  };

  const pivotName = editedData?.name ? "(" + editedData.name + ")" : "";
  const editModalTitle = "Edit pivot " + pivotName;

  return (
    <Form
      id="FormAddNewPivot"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {isLoading && <Loading />}

      <DndProvider backend={HTML5Backend}>
        <Modal
          width={900}
          title={editedData?.id ? editModalTitle : "New pivot table"}
          open={isOpen}
          onCancel={handleCloseModal}
          footer={[
            <Button key="back" htmlType="button" onClick={handleCloseModal}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              htmlType="submit"
              form="FormAddNewPivot"
            >
              Save
            </Button>,
          ]}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: NAME_REQUIRED }]}
          >
            <AntInput allowClear placeholder="Enter a name" />
          </Form.Item>

          <Form.Item
            name="apps"
            label="Apps"
            rules={[{ required: true, message: APP_REQUIRED }]}
          >
            <SelectStoreApp
              isMultiple={true}
              listApp={listStoreApps}
              activedApp={activedApp}
              setActivedApp={(apps) => {
                setActivedApp(apps);
                form.setFieldsValue({ apps });
              }}
            />
          </Form.Item>

          <div className="sm:hidden">
            {ListConfigs.map((el, idx) => (
              <Form.Item
                key={idx}
                name={el.value}
                label={el.label}
                rules={[
                  {
                    required: el.isRequired && isMobile,
                    message: OPTION_REQUIRED,
                  },
                ]}
              >
                <TreeSelect
                  showSearch
                  placeholder="Please select"
                  allowClear
                  // multiple
                  treeDefaultExpandAll
                  treeData={treeData}
                  treeLine={{ showLeafIcon: false }}
                  // treeCheckable
                  showCheckedStrategy={TreeSelect.SHOW_CHILD}
                />
              </Form.Item>
            ))}
          </div>

          <div className="mt-8 text-base hidden sm:block">Fields</div>
          <div className="mt-1 hidden sm:block">
            <div className="flex">
              <div className="flex flex-col w-[240px]">
                <Search
                  className="mb-3"
                  placeholder="Search"
                  value={search}
                  onChange={onChangeSearch}
                />
                <Tree
                  onExpand={onExpand}
                  titleRender={(nodeData: any) => {
                    return (
                      <div onClick={() => onClickName(nodeData.key)}>
                        {nodeData.title}
                      </div>
                    );
                  }}
                  expandedKeys={expandedKeys}
                  showLine={{ showLeafIcon: false }}
                  treeData={crrTreeData}
                  selectable={false}
                  className="grow overflow-auto max-h-96 tree-indent-sm"
                />
              </div>

              <div className="flex-1 ml-2 border-l pl-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-3">
                  {ListConfigs.map((config, idx) => {
                    const isValues = config.value === ConfigIds.values;
                    return (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center py-2 px-3 bg-slate-800 text-white rounded-t">
                          {config.icon}
                          <span>{config.label}</span>
                          {config.isRequired && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </div>

                        <DroppableArea
                          isValues={isValues}
                          accept={[TEXT_TYPE]}
                          onDrop={(item) =>
                            handleDrop(item, config.value, isValues)
                          }
                          handleDragEnd={(orderedData) =>
                            handleDragEnd(orderedData, config.value)
                          }
                          listData={activedFields[config.value]}
                          onRemoveFilter={(idx, text) =>
                            onRemoveFilter(idx, text, config.value)
                          }
                          onChangeFunc={onChangeFunc}
                          minHeight={config.minHeight}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </DndProvider>
    </Form>
  );
}

ModalAddAndEdit.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  listStoreApps: PropTypes.array,
  tableData: PropTypes.array,
  setTableData: PropTypes.func,
  editCallback: PropTypes.func,
  editedData: PropTypes.object,
};

export default ModalAddAndEdit;
