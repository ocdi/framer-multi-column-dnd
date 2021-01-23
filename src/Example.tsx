import * as React from "react";

import { Container } from "./Container";
import { Draggable } from "./Draggable";
import { DragContextProvider } from "./DragContext";

export const Example = () => {
  const stuckColours = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"];
  const stuckColours2 = ["red", "green", "blue", "#7700FF"];

  const [columnA, setColumnA] = React.useState([
    {
      colour: stuckColours[0],
      height: 50,
      key: "a"
    },
    {
      colour: stuckColours[1],
      height: 78,
      key: "b"
    },
    {
      colour: stuckColours[2],
      height: 40,
      key: "c"
    },
    {
      colour: stuckColours[3],
      height: 150,
      key: "d"
    }
  ]);

  const [columnB, setColumnB] = React.useState([
    {
      colour: "orange",
      height: 50,
      key: "e"
    },
    {
      colour: "yellow",
      height: 50,
      key: "f"
    }
  ]);

  function reorderStuff(keys: string[]) {
    setColumnA(
      keys.map((k) => {
        return columnA.find((f) => f.key === k);
      })
    );
  }

  function reorderStuffB(keys: string[]) {
    setColumnB(
      keys.map((k) => {
        return columnB.find((f) => f.key === k);
      })
    );
  }

  return (
    <DragContextProvider>
      {" "}
      columnA:
      {JSON.stringify(columnA)}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 300px",
          columnGap: 30
        }}
      >
        <Container containerId="col1" onReorderItems={reorderStuff}>
          {columnA.map((c, i) => {
            return (
              <Draggable key={c.key} itemId={c.key}>
                <div
                  style={{
                    width: 300,
                    height: c.height,
                    backgroundColor: c.colour
                  }}
                />
              </Draggable>
            );
          })}
        </Container>

        <Container containerId="col2" onReorderItems={reorderStuffB}>
          {columnB.map((c, i) => {
            return (
              <Draggable key={c.key} itemId={c.key}>
                <div
                  style={{
                    width: 300,
                    height: c.height,
                    backgroundColor: c.colour
                  }}
                />
              </Draggable>
            );
          })}
        </Container>
      </div>
    </DragContextProvider>
  );
};
