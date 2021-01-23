/*export interface Position {
  top: number;
  height: number;
  width: number;
  left: number;
}*/

export type Position = DOMRect;

export interface KeyedPosition {
  key: string;
  position: Position;
}
