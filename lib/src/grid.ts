
type Grid<T> = Array<Array<T>>;
type GridPoint = {
  col: number,
  row: number,
};

type GridNavigatorResult = GridPoint | undefined;
type GridNavigatorFn = (current: GridPoint) => GridNavigatorResult;

export function navigator<T>(grid: Grid<T>, start: GridPoint, step: GridNavigatorFn) {
  let next: GridPoint | undefined = start;

  function takeStep(): GridNavigatorResult {
    const current = next;

    if (current) {
      next = step(current);
    }

    return current;
  }

  takeStep.while = function takeStepWhile(condition: (result: GridPoint) => boolean, callback: (result: GridPoint) => true | undefined): void {
    while (next !== undefined && condition(next)) {
      const result = callback(next);
      takeStep();
      if (result !== undefined) {
        return;
      }
    }
  };

  return takeStep;
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
