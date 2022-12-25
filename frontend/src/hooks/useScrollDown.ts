import { useCallback } from "react";

export function useScrollDown(
  elementRef: React.MutableRefObject<HTMLElement | null>
) {
  const handler = useCallback(
    (y: number) => {
      elementRef.current?.scrollTo({
        top: y,
      });
    },
    [elementRef]
  );

  return [handler];
}
