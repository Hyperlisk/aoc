
import { array, comparator, input, log } from "@Hyperlisk/aoc-lib";

type PacketParts = Array<string>;

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

type InputType = Array<PacketParts>;

const inputData = await input.fetchProblemInput(2022, 13);
const parsedInput: InputType =
  input.parse(inputData, input.parse.split.line, String)
    .concat(["[[2]]","[[6]]"])
    .map(getPacketParts);

function solve(input: InputType) {
  let divider2Idx = -1;
  let divider6Idx = -1;
  array.sorted(input, comparePacketParts);
  input.forEach((packetParts, idx) => {
    if (packetParts.length === 1 && packetParts[0] === "[2]") {
      divider2Idx = idx + 1;
    }
    if (packetParts.length === 1 && packetParts[0] === "[6]") {
      divider6Idx = idx + 1;
    }
  });
  if (divider2Idx < 0 || divider6Idx < 0) {
    throw new Error('Could not find dividers.');
  }
  return divider2Idx * divider6Idx;
}

log.write(solve(parsedInput));
