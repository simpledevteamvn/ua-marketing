import { useEffect, useRef } from "react";

// https://www.robinwieruch.de/react-hook-detect-click-outside-component/
export const useOutsideClick = (callback) => {
  const ref = useRef<any>();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback && callback();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref]);

  return ref;
};

// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
export function useOutside(ref, callback: any = null) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback && callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
