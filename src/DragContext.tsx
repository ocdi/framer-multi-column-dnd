import { AnimateSharedLayout } from "framer-motion";
import * as React from "react";

import { Position, KeyedPosition } from "./Common";

type DraggingItem = {
  item: React.ReactNode;
  containerId: string;
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
          finishDragging: () => { draggingItem.current = undefined; setDraggingLevel(undefined); },
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
        <SingleDragContextProvider>{children}</SingleDragContextProvider>
      </DragContext.Provider>
    </AnimateSharedLayout>
  );
};

export const ContainerContext = React.createContext<{
  level: number;
  orientation: "vertical" | "horizontal";
}>({ level: 0, orientation: "vertical" });

type SingleDragContextApi = {
  enter: (level: number, itemId: string) => void;
  exit: (level: number, itemId: string) => void;
  inLevel: number;
  inId?: string;
};

export const SingleDragContext = React.createContext<SingleDragContextApi>(
  undefined
);

export const SingleDragContextProvider: React.FC = ({ children }) => {
  const [items, setItems] = React.useState<(string | undefined)[]>([]);
  const { draggingItem, draggingLevel } = React.useContext(DragContext);

  const lastEffect = React.useRef<undefined | (() => void)>();

  // when the drag operation finishes, we will be re-rendered, in which case we want to handle the last mouse operation
  React.useEffect(() => {
    if (!draggingLevel && lastEffect.current) {
      lastEffect.current();
      lastEffect.current = undefined;
    }
  }, [draggingLevel])

  function enter(level: number, itemId: string) {
    if (draggingItem.current) {
      console.log("currently dragging, not entering", level, itemId);
      lastEffect.current = () => enter(level, itemId);
      return;
    }

    console.log("entering", level, itemId);
    setItems((i) => {
      const n = [...i];
      n[level] = itemId;
      return n;
    });
  }
  function exit(level: number, itemId: string) {
    if (draggingItem.current) {
      console.log("currently dragging, not exiting", level, itemId);
      lastEffect.current = () => exit(level, itemId);
      return;
    }
    console.log("exiting", level, itemId);
    setItems((i) => {
      if (i[level] === itemId) {
        const n = [...i];
        n[level] = undefined;
        return n;
      }
      return i;
    });
  }

  let inLevel = 0;
  let inId: string | undefined = undefined;
  for (let i = items.length; i > 0; i--) {
    if (!!items[i]) {
      inLevel = i;
      inId = items[i];
      break;
    }
  }
  console.log("single drag", inLevel, inId, items);

  return (
    <SingleDragContext.Provider value={{ enter, exit, inLevel, inId }}>
      {children}
    </SingleDragContext.Provider>
  );
};
