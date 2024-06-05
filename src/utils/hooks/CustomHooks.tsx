import React, { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function useWindowSize() {
  // https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export const onLoadWhenAppChange = () => {
  const urlParams = useParams();
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    if (isInit) {
      return setIsInit(false);
    }
    window.location.reload();
  }, [urlParams.appId]);
};

export const useDevice = (mobileWidth = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  const [width] = useWindowSize();

  useEffect(() => {
    if (!width) return;
    if (width >= mobileWidth && isMobile) {
      return setIsMobile(false);
    }
    if (width < mobileWidth && !isMobile) {
      return setIsMobile(true);
    }
  }, [width]);

  return isMobile;
};
