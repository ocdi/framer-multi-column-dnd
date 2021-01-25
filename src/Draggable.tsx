import * as React from "react";
import { motion } from "framer-motion";
import { Position } from "./Common";
import { ContainerContext, useDragContext } from "./DragContext";
import { Container } from "./Container";

export interface IDraggableProps {
  children: any;
  itemId: string;
  moveItem?: (i: number, dragOffset: number) => void;
  dragIndex?: number;
  setPosition?: (dragIndex: number, pos: Position) => void;
  dragStart?: (index: number) => void;
  dragEnd?: () => void;
  containerId?: string;

  parentLevel: number;

  changeContainer?: (container: string) => void;
}

// Spring configs
const onTop = { zIndex: 1 };
const flat = {
  zIndex: 0,
  transition: { delay: 0.3 },
};

type DragState = {
  dragging: boolean;
  offset?: number;
};

type DragActions = "STOP" | { type: "START"; offset: number };
const DRAG_INITIAL_STATE = { dragging: false };

function dragReducer(state: DragState, action: DragActions): DragState {
  if (action === "STOP") {
    return DRAG_INITIAL_STATE;
  }

  return { dragging: true, offset: action.offset };
}

// big todo - handle horizontal dragging
export const Draggable = (props: IDraggableProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ dragging, offset }, dispatch] = React.useReducer(
    dragReducer,
    DRAG_INITIAL_STATE
  );

  const { level: parentLevel, orientation } = React.useContext(
    ContainerContext
  );
  const { setPosition, dragIndex, moveItem } = props;

  // Update the measured position of the item so we can calculate when we should rearrange.
  React.useEffect(() => {
    setPosition(dragIndex, ref.current.getBoundingClientRect());
  });

  // when the drag index changes the drag offset must be updated to our new position
  React.useEffect(() => {
    if (dragging) dispatch({ type: "START", offset: orientation == "vertical" ? ref.current.offsetTop : ref.current.offsetLeft });
  }, [dragIndex, dragging]);

  const dragContext = useDragContext();

  const previousPos = React.useRef("");

  //const isParentDragging = dragContext.draggingLevel == props.parentLevel;
  //const fixInPlace = dragContext.draggingLevel !== props.parentLevel;

  const allowDrag =
    dragContext.draggingLevel === props.parentLevel ||
    dragContext.draggingLevel === undefined;
  return (
    <motion.div
      key={allowDrag ? "drag" : "nodrag"}
      initial={false}
      layout={allowDrag}
      layoutId={allowDrag ? props.itemId : undefined}
      drag={allowDrag}
      dragMomentum={true}
      dragTransition={{
        bounceStiffness: 100000,
        bounceDamping: 100000,
      }}
      ref={ref}
      onDrag={(e, {point} ) => {
        if (!ref.current) {
          return;
        }

        setPosition(dragIndex, ref.current.getBoundingClientRect());

        // console.log((d.point.y - offset).toString() + " " + d.offset.y)

        moveItem(dragIndex, (orientation == "vertical" ? point.y : point.x) - offset);

        if (
          previousPos.current ===
          JSON.stringify(ref.current?.getBoundingClientRect())
        ) {
          return;
        }

        previousPos.current = JSON.stringify(
          ref.current?.getBoundingClientRect()
        );

        const overlapContainer = dragContext.getOverlappingDraggableId(
          ref.current?.getBoundingClientRect(),
          props.parentLevel
        );
        if (overlapContainer !== props.containerId) {
          props.changeContainer(overlapContainer);
          return;
        }
      }}
      animate={dragging ? onTop : flat}
      onDragStart={(a, { point }) => {
        dragContext.startDragging(props.parentLevel);
        console.log("drag start", props.itemId);
        props?.dragStart(dragIndex);
        dispatch({ type: "START", offset: orientation == "vertical" ? point.y : point.x });
      }}
      onDragEnd={() => {
        dispatch("STOP");
        props.dragEnd();
        setTimeout(() => dragContext.finishDragging(), 500);
      }}
    >
      {props.children}
      {dragging && <div>{JSON.stringify(ref?.current?.offsetLeft)}</div>}
      drag index: {props.dragIndex} id: {props.itemId}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 5,
        }}
      >
        {ref.current?.offsetTop}
        <span>{allowDrag && <div>allow drag</div>}</span>
      </div>
    </motion.div>
  );
};
