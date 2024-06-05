import { Dialog, Transition } from "@headlessui/react";
import React from "react";
import { Fragment } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";

// Ref: https://headlessui.com/react/dialog
function Modal(props) {
  const {
    isOpen,
    onClose,
    title,
    clickOutside,
    children,
    submitLabel,
    cancelLabel,
    onSubmit,
    disabled,
    submitClass,
    submitBtnEl,
    submitProps,
  } = props;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-1110"
        onClose={clickOutside ? onClose : () => null}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Remove the overflow-hidden or use a Portal + a positioning library like Popper.js or Floating UI */}
              {/* https://github.com/tailwindlabs/headlessui/issues/1420 */}
              <Dialog.Panel className="w-full max-w-md transform rounded-md bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="flex justify-between items-center text-lg leading-6 py-4 px-6"
                >
                  <span className="font-bold text-gray-900">{title}</span>
                  <CloseOutlined onClick={onClose} className="ml-2" />
                </Dialog.Title>
                <hr />

                <div className="p-6">
                  <div>{children}</div>

                  <div className="mt-6 flex justify-end">
                    <Button className="mr-3" onClick={onClose}>
                      {cancelLabel}
                    </Button>

                    {typeof submitBtnEl !== "undefined" ? (
                      submitBtnEl
                    ) : (
                      <Button
                        {...submitProps}
                        type="primary"
                        className={submitClass}
                        disabled={disabled}
                        onClick={onSubmit}
                      >
                        {submitLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

Modal.defaultProps = {
  clickOutside: false,
  cancelLabel: "Cancel",
  disabled: false,
  submitLabel: "Save",
  submitClass: "",
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clickOutside: PropTypes.bool,
  title: PropTypes.string,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  submitClass: PropTypes.string,
  disabled: PropTypes.any,
  submitBtnEl: PropTypes.any,
  submitProps: PropTypes.object,
};

export default Modal;
