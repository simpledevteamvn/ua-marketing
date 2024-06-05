import React from "react";
import PropTypes from "prop-types";
import { PLATFORMS, STORE } from "../../constants/constants";
import classNames from "classnames";
import { handleErrorImage } from "../../utils/Helpers";
import { AiFillAndroid } from "@react-icons/all-files/ai/AiFillAndroid";
import { AiFillApple } from "@react-icons/all-files/ai/AiFillApple";

function GamePlatformIcon(props) {
  const { app, imgClass, inputSize, iconClass } = props;
  const { store, platform } = app;

  if (!app.icon) return <></>;

  let isPlatformIOS = false;
  let isPlatformAndroid = false;
  if (store && STORE[store]) {
    isPlatformIOS = STORE[store].platform === PLATFORMS.ios;
    isPlatformAndroid = STORE[store].platform === PLATFORMS.android;
  } else if (platform) {
    isPlatformIOS = platform === PLATFORMS.ios;
    isPlatformAndroid = platform === PLATFORMS.android;
  }

  const defaultImgClass =
    "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-md lg:rounded-2xl";
  const inputSizeImgClass = "w-5 h-5 rounded-[0.15rem] mr-[21px]";
  const defaultIconClass = `absolute rounded-full bottom-0.5 right-[-14px] h-6 w-6 p-[3px] bg-white text-black/60 shadow-custom1 ${iconClass}`;
  const inputSizeClass =
    "absolute rounded-full right-[5px] bottom-[0px] h-3.5 w-3.5 p-[1px] bg-black/60 text-white";

  const imgClassName = inputSize ? inputSizeImgClass : defaultImgClass;
  const storeIconClass = inputSize ? inputSizeClass : defaultIconClass;

  return (
    <div className="relative flex-shrink-0">
      <img
        src={app.icon}
        alt=" "
        className={classNames(!imgClass ? imgClassName : imgClass)}
        referrerPolicy="no-referrer"
        onError={handleErrorImage}
      />
      {isPlatformIOS && <AiFillApple size="20" className={storeIconClass} />}
      {isPlatformAndroid && (
        <AiFillAndroid size="20" className={storeIconClass} />
      )}
    </div>
  );
}

GamePlatformIcon.defaultProps = {
  imgClass: "",
  iconClass: "",
};

GamePlatformIcon.propTypes = {
  app: PropTypes.object,
  imgClass: PropTypes.string,
  iconClass: PropTypes.string,
  inputSize: PropTypes.bool,
};

export default GamePlatformIcon;
