
import { array, comparator, input, log } from "@Hyperlisk/aoc-lib";

type PacketParts = Array<string>;

type Signal = {
  left:  PacketParts;
  right: PacketParts;
};

type Packet = Array<number | Packet>;

function isPacketString(part: string) {
  return part[0] === '[' || part[part.length - 1] === ']';
}

function getPacketParts(packet: string): PacketParts {
  const parts: Array<string> = [];
  if (!isPacketString(packet)) {
    throw new Error(`Received an invalid packet: "${packet}"`);
  }

  let partStart = 1;
  let depth = 1;
  for (let i = 1;i < packet.length - 1;i++) {
    if (packet[i] === '[') {
      depth += 1;
    } else if (packet[i] === ']') {
      depth -= 1;
    } else if (packet[i] === ',') {
      if (depth === 1) {
        // Do not include the ','
        parts.push(packet.substring(partStart, i));
        partStart = i + 1;
      }
    }
  }
  if (partStart !== packet.length - 1) {
    parts.push(packet.substring(partStart, packet.length - 1));
  }
  return parts;
}

function getSignalParts(signal: string): Signal {
  const [left, right] = input.parse(signal, input.parse.split.line, String);
  return {
    left: getPacketParts(left),
    right: getPacketParts(right),
  };
}

const makePacketMemo = new Map<string, Packet>();
function makePacket(packet: string): Packet {
  if (makePacketMemo.has(packet)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return makePacketMemo.get(packet)!;
  }
  const result: Packet = isPacketString(packet)
    ? getPacketParts(packet).map(makePacket)
    : [parseInt(packet, 10)];
  makePacketMemo.set(packet, result);
  return result;
}

const comparePacket: comparator.Comparator<Packet> = (a, b) => {
  const greaterLength = a.length > b.length ? a.length : b.length;
  for (let i = 0;i < greaterLength;i++) {
    const aI = a[i];
    const bI = b[i];
    if (aI === undefined && bI !== undefined) {
      return -1;
    }
    if (aI !== undefined && bI === undefined) {
      return 1;
    }
    const cmp = (typeof aI === "number" && typeof bI === "number")
      ? comparator.numbers(aI, bI)
      : comparePacket(
        Array.isArray(aI) ? aI : [aI],
        Array.isArray(bI) ? bI : [bI],
      );
    if (cmp !== 0) {
      return cmp;
    }
  }
  return 0;
};

const comparePacketParts: comparator.Comparator<PacketParts> = (a, b) => {
  const packetA = a.map(makePacket);
  const packetB = b.map(makePacket);
  return comparePacket(packetA, packetB);
};

type InputType = Array<Signal>;

const inputData = await input.fetchProblemInput(2022, 13);
const parsedInput: InputType = input.parse(inputData, input.parse.split.group, getSignalParts);

function solve(input: InputType) {
  return array.sum(
    input.map((signalParts, idx) => {
      const cmp = comparePacketParts(signalParts.left, signalParts.right);
      if (cmp === -1 || cmp === 0) {
        return idx + 1;
      }
      return 0;
    }),
  );
}

log.write(solve(parsedInput));
