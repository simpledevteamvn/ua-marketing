import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import { GiGamepad } from "@react-icons/all-files/gi/GiGamepad";
import React from "react";
import { handleErrorImage } from "../../../utils/Helpers";
import { CREATIVE_TYPES } from "../../../constants/constants";
// @ts-ignore
import ImgOff from "../../../images/creative/imgOff.svg";
import YoutubeOutlined from "@ant-design/icons/lib/icons/YoutubeOutlined";

export const getYoutubeId = (url) => {
  // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
};

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
// const IMGS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];

export const checkVideo = (url) => {
  // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
  const VIDEOS = [
    ".mp4",
    ".webm",
    ".ogg",
    ".ogv",
    ".mpeg",
    ".mpg",
    ".m4v",
    ".m4p",
    ".mov",
    ".3gp",
  ];

  if (!url || typeof url !== "string") {
    return false;
  }

  return VIDEOS.some((format) => url.endsWith(format));
};

export const NameColumn = (record, setPreviewData, setImgPreview) => {
  const { type, url } = record;

  const LinkEl = (recordUrl) => (
    <a
      href={recordUrl}
      className="shrink-0 block cursor-pointer py-3 ml-1"
      target="_blank"
    >
      <BiLinkExternal className="text-base" />
    </a>
  );
  const assetClass = "w-10 h-10 object-cover rounded cursor-pointer shrink-0";
  const recordName = (
    <div className="ml-2 truncate" title={record.name}>
      {record.name}
    </div>
  );

  if (url) {
    const getVideoEl = () => {
      // "http://cdn-adn.rayjump.com/cdn-adn/v2/portal/23/02/17/14/49/63ef2371a556b.mp4";
      return (
        <div className="flex justify-between items-center truncate">
          <div className="flex items-center truncate">
            {/* https://stackoverflow.com/questions/23640869/create-thumbnail-from-video-file-via-file-input/29806483#29806483 */}
            <video
              className={assetClass}
              playsInline
              src={url + "#t=1"}
              onClick={() => setPreviewData(record)}
              title="Click to view the video"
            />
            {recordName}
          </div>
          {LinkEl(url)}
        </div>
      );
    };
    const getPlayableEl = () => (
      <div className="flex justify-between items-center truncate">
        <div className="flex items-center truncate">
          <div
            className="shrink-0 w-10 h-10 rounded bg-antPrimary/10 hover:bg-antPrimary/20 cursor-pointer flex justify-center items-center"
            onClick={() => setPreviewData(record)}
            title="Click to play"
          >
            <GiGamepad size={26} className="text-antPrimary" />
          </div>
          {recordName}
        </div>
        {LinkEl(url)}
      </div>
    );
    const getImgEl = () => (
      <div className="flex items-center truncate">
        <img
          src={url}
          className={assetClass}
          alt=" "
          referrerPolicy="no-referrer"
          onError={handleErrorImage}
          onClick={() => setImgPreview(record)}
          title="Click to view the image"
        />
        {recordName}
      </div>
    );

    if (url.includes("/www.youtube.com/")) {
      const ytbId = getYoutubeId(url);

      return (
        <div className="flex justify-between items-center">
          <div className="flex items-center truncate">
            <div className="relative">
              <img
                src={`https://img.youtube.com/vi/${ytbId}/mqdefault.jpg`}
                alt=" "
                className={assetClass}
                referrerPolicy="no-referrer"
                onError={handleErrorImage}
              />
              <div
                className="absolute top-0 left-0 w-full h-full flex justify-center items-center cursor-pointer"
                title="Click to view the video"
                onClick={() => setPreviewData(record)}
              >
                <YoutubeOutlined className="!text-red-600 text-3xl" />
              </div>
            </div>
            {recordName}
          </div>
          {LinkEl(`https://www.youtube.com/watch?v=${ytbId}`)}
        </div>
      );
    }

    if (type === CREATIVE_TYPES.video) {
      return getVideoEl();
    } else if (type === CREATIVE_TYPES.playable) {
      return getPlayableEl();
    } else if (
      type === CREATIVE_TYPES.image ||
      type === CREATIVE_TYPES.endCard
    ) {
      return getImgEl();
    }

    if (checkVideo(url)) {
      return getVideoEl();
    }

    // Exist url with params, so don't edit the below code with endsWith
    if (url.includes(".html")) {
      return getPlayableEl();
    }

    return getImgEl();
  }

  return (
    <div className="flex items-center truncate">
      <img src={ImgOff} className="mr-1" />
      {recordName}
    </div>
  );
};
