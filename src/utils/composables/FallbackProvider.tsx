import * as React from "react";

export type FallbackType = NonNullable<React.ReactNode> | null;

export interface FallbackContextType {
  updateFallback: (fallback: FallbackType) => void;
}

export const FallbackContext = React.createContext<FallbackContextType>({
  updateFallback: () => {},
});

interface FallbackProviderProps {
  children: any;
}

// https://github.com/HanMoeHtet/route-level-code-split
// https://stackoverflow.com/questions/72932889/react-router-lazy-suspense-usetransition-how-to-stay-on-current-page-until-n
export const FallbackProvider: React.FC<FallbackProviderProps> = ({
  children,
}) => {
  const [fallback, setFallback] = React.useState<FallbackType>(null);

  const updateFallback = React.useCallback((fallback: FallbackType) => {
    setFallback(() => fallback);
  }, []);

  const renderChildren = React.useMemo(() => {
    return children;
  }, [children]);

  return (
    <FallbackContext.Provider value={{ updateFallback }}>
      <React.Suspense fallback={fallback}>{renderChildren}</React.Suspense>
    </FallbackContext.Provider>
  );
};
