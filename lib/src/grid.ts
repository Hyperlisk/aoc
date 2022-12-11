
type GridPoint = {
  col: number,
  row: number,
};

type GridNavigatorResult = GridPoint | undefined;
type GridNavigatorFn = (current: GridPoint) => GridNavigatorResult;

export function navigator(start: GridPoint, step: GridNavigatorFn) {
  let current: GridNavigatorResult;

  function takeStep(): GridNavigatorResult {
    if (current) {
      current = step(current);
    } else {
      current = start;
    }

    return current;
  }

  takeStep.current = function takeStepCurrent() {
    return current;
  };

  takeStep.while = function takeStepWhile(condition: (next: GridPoint) => boolean, callback: (current: GridPoint) => true | undefined): void {
    do {
      takeStep();
      if (current === undefined) {
        return;
      }
      if (!condition(current)) {
        return;
      }
      const result = callback(current);
      if (result !== undefined) {
        return;
      }
    } while (current);
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
