import React from "react";
import Modal from "antd/lib/modal";

function ImagePreview({ imgPreview, setImgPreview }) {
  const previewName = imgPreview?.name;
  const previewTitle = previewName
    ? "View " + imgPreview?.name
    : "Preview image";

  const getPreviewImgWidth = () => {
    const width = window.innerWidth * 0.7;

    if (width < 520) return 520;
    if (width > 1000) return 1000;
    return width;
  };

  return (
    <Modal
      open={!!imgPreview?.url}
      title={previewTitle}
      centered
      footer={null}
      width={getPreviewImgWidth()}
      onCancel={() => setImgPreview({})}
    >
      <img
        alt=" "
        className="w-full max-h-[600px] object-contain"
        src={imgPreview.url}
      />
    </Modal>
  );
}

export default ImagePreview;
