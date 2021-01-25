import * as React from "react";
import { motion } from "framer-motion";
import { Position } from "./Common";
import { useDragContext } from "./DragContext";

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

  changeContainer?: (container: string) => void
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
  const { setPosition, dragIndex, moveItem } = props;

  // Update the measured position of the item so we can calculate when we should rearrange.
  React.useEffect(() => {
    setPosition(dragIndex, ref.current.getBoundingClientRect());
  });

  // when the drag index changes the drag offset must be updated to our new position
  React.useEffect(() => {
    if (dragging) dispatch({ type: "START", offset: ref.current.offsetTop });
  }, [dragIndex, dragging]);

  const dragContext = useDragContext();

  const previousPos = React.useRef("");

  return (
    <motion.div
      initial={false}
      layout={props.parentLevel !== 1}
      layoutId={props.parentLevel !== 1 ? props.itemId : undefined}
      drag={props.parentLevel !== 1}
      ref={ref}
      onDrag={(e, d) => {
        if (!ref.current) {
          return;
        }

        setPosition(dragIndex, ref.current.getBoundingClientRect());

        // console.log((d.point.y - offset).toString() + " " + d.offset.y)

        moveItem(dragIndex, d.point.y - offset);

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
        console.log("drag start",props.itemId)
        props?.dragStart(dragIndex);
        dispatch({ type: "START", offset: point.y });
      }}
      onDragEnd={() => {
        dispatch("STOP");
        props.dragEnd();
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
        <span>{ref.current?.offsetHeight}</span>
      </div>
    </motion.div>
  );
};
