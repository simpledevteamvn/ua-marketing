import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import { useWindowSize } from "../../../../partials/sidebar/Sidebar";
import { getYoutubeId } from "../Helpers";
import { getLabelFromStr } from "../../../../utils/Helpers";

function VideoPopup(props) {
  const { onClose, previewData, classNames } = props;
  const [width, height] = useWindowSize();

  const [maxWidth, setMaxWidth] = useState<number>();
  const [videoHeight, setVideoHeight] = useState<number>();

  const videoUrl = previewData.url;

  useEffect(() => {
    const totalPaddingWidth = 12 * 2 + 4 * 2;

    if (!width || !height) return;

    let newHeight = 500;
    if (height > 800) {
      newHeight = height * 0.75 - 140;
    } else {
      newHeight = height * 0.9 - 140;
    }
    setVideoHeight(newHeight);

    if (width < 768) {
      return setMaxWidth(width - totalPaddingWidth);
    }
    if (width > 1200) {
      return setMaxWidth(width * 0.55);
    }
    setMaxWidth(width * 0.6);
  }, [width, height]);

  const videoClass = "object-contain m-auto rounded-sm";

  if (!videoUrl) return <></>;

  let videoEl = <></>;
  if (videoUrl.includes("/www.youtube.com/")) {
    const ytbId = getYoutubeId(videoUrl);
    const ytbVideo = "https://www.youtube.com/embed/" + ytbId + "?autoplay=1";

    videoEl = (
      <iframe
        className={videoClass}
        style={{ maxWidth, height: videoHeight }}
        src={ytbVideo}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (videoUrl.includes(".html")) {
    videoEl = (
      <embed
        className="m-auto"
        type="text/html"
        src={videoUrl}
        style={{ maxWidth, height: videoHeight }}
      />
    );
  } else {
    videoEl = (
      <video
        className={videoClass}
        style={{ maxWidth, height: videoHeight }}
        src={videoUrl}
        controls
        autoPlay
        playsInline
      />
    );
  }

  const fieldClass = "font-semibold text-black";

  return (
    <div
      className={`fixed right-0 bottom-0 z-1100 border shadow-lg bg-white rounded ${classNames}`}
    >
      <div className="flex flex-col">
        <div
          onClick={onClose}
          className="px-3 pt-2 text-lg cursor-pointer w-11"
        >
          <CloseOutlined />
        </div>

        <div className="mb-4 mx-3">
          <div className="border rounded-sm">{videoEl}</div>
        </div>

        <div className="flex flex-col space-y-2 mb-2 px-4">
          <div>
            <div className={fieldClass}>Name</div>
            <div className="truncate">{previewData.name}</div>
          </div>
          <div>
            <div className={fieldClass}>Type</div>
            <div className="truncate">{getLabelFromStr(previewData.type)}</div>
          </div>
          {/* <div>
            <div className={fieldClass}>Duration</div>
            <div>0.25</div>
          </div>
          <div>
            <div className={fieldClass}>Resolution</div>
            <div>404 x 720</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

VideoPopup.propTypes = {
  onClose: PropTypes.func,
  previewData: PropTypes.object,
  classNames: PropTypes.string,
};

export default VideoPopup;
