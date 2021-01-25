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
    level: number,
    containerId: string,
    position: Position
  ) => void;
  getOverlappingDraggableId: (rect: Position, parentLevel: number) => string;

  draggingItem: React.MutableRefObject<DraggingItem | undefined>;

  draggingLevel?: number;
  startDragging: (level: number) => void;
  finishDragging: () => void;
};

const DragContext = React.createContext<DragContextApi>(undefined);

export const useDragContext = () => React.useContext(DragContext);

export const DragContextProvider: React.FC = ({ children }) => {
  const draggedPosition = React.useRef<KeyedPosition>();
  const containers = React.useRef<Record<string, Position>[]>([]);

  const draggingItem = React.useRef<DraggingItem | undefined>(undefined);

  const [draggingLevel, setDraggingLevel] = React.useState<number | undefined>(
    undefined
  );

  function setContainerPosition(
    level: number,
    containerId: string,
    position: Position
  ) {
    containers.current[level] = containers.current[level] ?? {};
    containers.current[level][containerId] = position;
  }

  function setDragPosition(k, p) {
    draggedPosition.current = { key: k, position: p };
  }

  console.log("rendering dragContext");

  return (
    <AnimateSharedLayout>
      <DragContext.Provider
        value={{
          setDragPosition,
          setContainerPosition,
          draggingLevel,
          startDragging: (level) => setDraggingLevel(level),
          finishDragging: () => setDraggingLevel(undefined),
          draggingItem,
          dragPosition: draggedPosition,
          getOverlappingDraggableId: (rect, parentLevel) => {
            if (!rect) return;
            const intersect2 = Object.entries(containers.current[parentLevel])
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

export const ContainerContext = React.createContext<{
  level: number;
  orientation: "vertical" | "horizontal";
}>({ level: 0, orientation: "vertical" });
