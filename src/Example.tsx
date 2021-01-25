import * as React from "react";

import { Container } from "./Container";
import { Draggable } from "./Draggable";
import { DragContextProvider } from "./DragContext";

export const Example = () => {
  const stuckColours = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"];
  const stuckColours2 = ["red", "green", "blue", "#7700FF"];

  const [, rerender] = React.useReducer((a) => !a, false);

  const [columnA, setColumnA] = React.useState([
    {
      colour: stuckColours[0],
      height: 50,
      key: "a",
    },
    {
      colour: stuckColours[1],
      height: 78,
      key: "b",
    },
    {
      colour: stuckColours[2],
      height: 40,
      key: "c",
    },
    {
      colour: stuckColours[3],
      height: 150,
      key: "d",
    },
  ]);

  const [columnB, setColumnB] = React.useState([
    {
      colour: "orange",
      height: 50,
      key: "e",
    },
    {
      colour: "yellow",
      height: 50,
      key: "f",
    },
  ]);

  function reorderStuff(keys: string[]) {
    setColumnA(
      keys
        .map((k) => {
          return columnA.find((f) => f.key === k);
        })
        .filter((a) => !!a)
    );
  }

  function reorderStuffB(keys: string[]) {
    setColumnB(
      keys
        .map((k) => {
          return columnB.find((f) => f.key === k);
        })
        .filter((a) => !!a)
    );
  }

  function changeContainer(itemKey: string, containerId: string) {
    // find and move the item between containers
    const ca = columnA.find((a) => a.key == itemKey);
    let i;
    if (ca) {
      i = ca;
      if (containerId == "col1") return;
      const index = columnA.indexOf(ca);
      columnA.splice(index, 1);
    }
    const cb = columnB.find((a) => a.key == itemKey);
    if (cb) {
      if (containerId == "col2") return;
      i = cb;
      const index = columnB.indexOf(cb);
      columnB.splice(index, 1);
    }

    if (!i) return;

    if (containerId == "col1") columnA.push(i);
    if (containerId == "col2") columnB.push(i);

    console.log("changed columns", columnA, columnB);

    setColumnA(columnA);
    setColumnB(columnB);
    // I'm unsure why the sets above doesn't actually cause a rerender, however the reducer does
    rerender();
  }

  function moveD1() {
    changeContainer("d", "col1");
  }
  function moveD() {
    changeContainer("d", "col2");
  }

  console.log("rendering example");
  return (
    <>
      <button onClick={moveD1}>Move D to col1</button>
      <button onClick={moveD}>Move D to col2</button>

      <DragContextProvider>
        {" "}
        <div>
          <Container orientation="horizontal" containerId="row">
            <Draggable itemId="columnA">
              <Container
                containerId="col1"
                onReorderItems={reorderStuff}
              >
                {columnA.map((c, i) => {
                  return (
                    <Draggable
                      key={c.key}
                      itemId={c.key}
                      changeContainer={(containerId) =>
                        changeContainer(c.key, containerId)
                      }
                    >
                      <div
                        style={{
                          width: 300,
                          height: c.height,
                          backgroundColor: c.colour,
                        }}
                      />
                    </Draggable>
                  );
                })}
              </Container>
            </Draggable>
            <Draggable itemId="columnB">
              <Container
                containerId="col2"
                onReorderItems={reorderStuffB}
              >
                {columnB.map((c, i) => {
                  return (
                    <Draggable
                      key={c.key}
                      itemId={c.key}
                      changeContainer={(containerId) =>
                        changeContainer(c.key, containerId)
                      }
                    >
                      <div
                        style={{
                          width: 300,
                          height: c.height,
                          backgroundColor: c.colour,
                        }}
                      />
                    </Draggable>
                  );
                })}
              </Container>
            </Draggable>
          </Container>
        </div>
      </DragContextProvider>
    </>
  );
};
