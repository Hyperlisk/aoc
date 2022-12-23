
import * as array from "./array.js";
import * as comparator from "./comparator.js";
import * as ds from "./ds.js";

export type Node<T> = {
  edges: Array<Node<T>>;
  value: T;
};

export function dijkstra<T>(start: Node<T>, end: Node<T>): Array<Node<T>> | null {
  const distances = new Map<Node<T>, number>();
  const previous = new Map<Node<T>, Node<T> | null>();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const queue = ds.queue.priority<Node<T>>((a, b) => comparator.numbers(distances.get(a)!, distances.get(b)!));

  for (const node of reachable(start)) {
    distances.set(node, Infinity);
    previous.set(node, null);
  }
  distances.set(start, 0);

  let current: Node<T> | undefined = undefined;

  queue.push(start);
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current = queue.pop()!;
    if (current === end) {
      break;
    }
    for (const neighbor of current.edges) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const distance = distances.get(current)! + 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (distance < distances.get(neighbor)!) {
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
  while (current !== start) {
    path.push(current);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    current = previous.get(current)!;
  }
  path.push(current);

  return array.reverse(path);
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
