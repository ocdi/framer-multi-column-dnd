import { AnimateSharedLayout } from "framer-motion";
import * as React from "react";

import { Position, KeyedPosition } from "./Common";

type DraggingItem = {
  item: React.ReactNode;
  containerId: string;
  steal: () => boolean;
};

type DragContextApi = {
  setDragPosition: (key: string, position: Position) => void;
  dragPosition: React.MutableRefObject<KeyedPosition | undefined>;
  setContainerPosition: (
    containerId: string,
    position: Position
  ) => void;
  getOverlappingDraggableId: (rect: Position) => string;

  draggingItem: React.MutableRefObject<DraggingItem | undefined>;
};

const DragContext = React.createContext<DragContextApi>(undefined);

export const useDragContext = () => React.useContext(DragContext);

export const DragContextProvider: React.FC = ({ children }) => {
  const draggedPosition = React.useRef<KeyedPosition>();
  const containers = React.useRef<Record<string, Position>>({});

  const draggingItem = React.useRef<DraggingItem | undefined>(undefined);

  function setContainerPosition(
    containerId: string,
    position: Position
  ) {
    containers.current[containerId] = position;
  }

  function setDragPosition(k, p) {
    draggedPosition.current = { key: k, position: p };
  }

  return (
    <AnimateSharedLayout>
      <DragContext.Provider
        value={{
          setDragPosition,
          setContainerPosition,
          draggingItem,
          dragPosition: draggedPosition,
          getOverlappingDraggableId: (rect: Position) => {
            if (!rect) return;
            const intersect2 = Object.entries(containers.current)
              .map(([key, rectSelection]) => {
                const x_overlap = Math.max(
                  0,
                  Math.min(rect.right, rectSelection.right) -
                    Math.max(rect.left, rectSelection.left)
                );
                const y_overlap = Math.max(
                  0,
                  Math.min(rect.bottom, rectSelection.bottom) -
                    Math.max(rect.top, rectSelection.top)
                );
                const overlapArea = x_overlap * y_overlap;

                return {
                  overlapArea,
                  key,
                };
              })
              .sort((a, b) => b.overlapArea - a.overlapArea)[0]?.key;

            // const intersects = Object.entries(containers.current)
            //   .filter(([key, rectSelection]) => {
            //     if (
            //       rect.top + rect.height > rectSelection.top &&
            //       rect.left + rect.width > rectSelection.left &&
            //       rect.bottom - rect.height < rectSelection.bottom &&
            //       rect.right - rect.width < rectSelection.right
            //     ) {
            //       return true;
            //     }
            //     return false;
            //   })
            //   .map((a) => a[0]);

            console.log(intersect2);

            return intersect2;
          },
        }}
      >
        {children}
      </DragContext.Provider>
    </AnimateSharedLayout>
  );
};
