import { clamp, distance } from "@popmotion/popcorn";
import { Position } from "./Common";

// Prevent rapid reverse swapping
const buffer = 5;

// export const findIndex = (
//   i: number,
//   yOffset: number,
//   positions: Position[]
// ) => {
//   let target = i;
//   const { top } = positions[i];

//   // If moving down
//   if (yOffset > 0) {
//     const nextItem = positions[i + 1];
//     if (nextItem === undefined) return i;

//     const swapOffset =
//       distance(top, nextItem.top + nextItem.height / 2) + buffer;

//     if (yOffset > swapOffset) target = i + 1;

//     // If moving up
//   } else if (yOffset < 0) {
//     const prevItem = positions[i - 1];
//     if (prevItem === undefined) return i;

//     const swapOffset =
//       distance(top, prevItem.top - prevItem.height / 2) + buffer;
//     if (yOffset < -swapOffset) target = i - 1;
//   }

//   return clamp(0, positions.length, target);
// };


const fi = (i: number,
  offset: number,
  positions: Position[], 
  start: "left" | "top", length: "width" | "height") => {
   
    let target = i;
    const s = positions[i][start];


  // If moving down
  if (offset > 0) {
    const nextItem = positions[i + 1];
    if (nextItem === undefined) return i;

    console.log('moving down', s, nextItem[start])

    const swapOffset =
      distance(s, nextItem[start] + nextItem[length] / 2) + buffer;

    if (offset > swapOffset) target = i + 1;

    // If moving up
  } else if (offset < 0) {
    


    const prevItem = positions[i - 1];
    if (prevItem === undefined) return i;

    console.log('moving up', s, prevItem[start])

    const swapOffset =
      distance(s, prevItem[start] - prevItem[length] / 2) + buffer;
    if (offset < -swapOffset) target = i - 1;
  }

  return clamp(0, positions.length, target);
 }


 
export const findIndexHorizontal = (
  i: number,
  xOffset: number,
  positions: Position[]
) => {
  return fi(i, xOffset, positions, "left", "width");
};



export const findIndexVertical = (
  i: number,
  xOffset: number,
  positions: Position[]
) => {
  return fi(i, xOffset, positions, "top", "height");
};
