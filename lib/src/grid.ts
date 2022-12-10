
type Grid<T> = Array<Array<T>>;
type GridPoint = {
  col: number,
  row: number,
};

type GridNavigatorFn = (current: GridPoint) => GridPoint | undefined;

export function navigator<T>(grid: Grid<T>, start: GridPoint, step: GridNavigatorFn): () => GridPoint | undefined {
  let next: GridPoint | undefined = start;
  return function takeStep() {
    const current = next;

    if (current) {
      next = step(current);
    }

    return current;
  };
}

navigator.step = {
  down(current: GridPoint) {
    return {
      col: current.col,
      row: current.row + 1,
    };
  },
  left(current: GridPoint) {
    return {
      col: current.col - 1,
      row: current.row,
    };
  },
  right(current: GridPoint) {
    return {
      col: current.col + 1,
      row: current.row,
    };
  },
  up(current: GridPoint) {
    return {
      col: current.col,
      row: current.row - 1,
    };
  },
};
