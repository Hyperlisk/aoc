
import * as array from "./array.js";
import * as comparator from "./comparator.js";
import * as ds from "./ds.js";

export type Node<T> = {
  edges: Array<Node<T>>;
  value: T;
};

export function dijkstra<T>(start: Node<T>, end: Node<T>): Array<Node<T>> | null {
  const distances = new Map<Node<T>, number>();
  const getDistance = (node: Node<T>) => distances.has(node) ? distances.get(node) || 0 : Infinity;
  const previous = new Map<Node<T>, Node<T>>();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const queue = ds.queue.priority<Node<T>>((a, b) => comparator.numbers(getDistance(a), getDistance(b)));

  distances.set(start, 0);

  let current: Node<T> | undefined = undefined;

  queue.push(start);
  while (queue.length > 0) {
    current = queue.pop();
    if (current === end) {
      break;
    }
    for (const neighbor of current.edges) {
      const distance = getDistance(current) + 1;
      if (distance < getDistance(neighbor)) {
        distances.set(neighbor, distance);
        previous.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  if (current !== end) {
    return null;
  }
  const path: Array<Node<T>> = [];
  path.push(current);
  do {
    current = previous.get(current);
    if (current) {
      path.push(current);
    }
  } while (current && current !== start);

  return array.reverse(path);
}

export function node<T>(value: T): Node<T> {
  return {
    edges: [],
    value: value,
  };
}

export function reachable<T>(start: Node<T>): Set<Node<T>> {
  const reachable = new Set<Node<T>>();
  const queue = [start];
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = queue.shift()!;
    if (!reachable.has(current)) {
      reachable.add(current);
      queue.push(...current.edges);
    }
  }
  return reachable;
}
