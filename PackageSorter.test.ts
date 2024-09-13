import { test, expect, describe, beforeEach } from "bun:test";
import { Stack, PackageSorter } from "./PackageSorter";

type SortInput = [number, number, number, number];

let sorter: PackageSorter;
let sideLength: number;

let bulkyAndHeavyExactly: SortInput;
let bulkyAndHeavy: SortInput;
let heavy: SortInput;
let bulky: SortInput;
let notBulkyNorHeavy: SortInput;

beforeEach(() => {
  sorter = new PackageSorter();

  // calculate the side length of a cube with the max volume
  sideLength = Math.cbrt(sorter.BULKY_MAX_VOLUME_CM);

  // create a package that is === BULKY_MAX_VOLUME_CM and === HEAVY_MAX_MASS_KG
  bulkyAndHeavyExactly = [
    sideLength,
    sideLength,
    sideLength,
    sorter.HEAVY_MAX_MASS_KG, // max mass
  ];

  // create a package that is > BULKY_MAX_VOLUME_CM and > HEAVY_MAX_MASS_KG
  bulkyAndHeavy = [
    sideLength + 1,
    sideLength,
    sideLength,
    sorter.HEAVY_MAX_MASS_KG + 1, // > max mass
  ];

  // create a package that is < BULKY_MAX_VOLUME_CM and === HEAVY_MAX_MASS_KG
  heavy = [
    sideLength - 1,
    sideLength,
    sideLength,
    sorter.HEAVY_MAX_MASS_KG, // max mass
  ];

  // create a package that is > BULKY_MAX_VOLUME_CM and < HEAVY_MAX_MASS_KG
  bulky = [
    sideLength + 1,
    sideLength,
    sideLength,
    sorter.HEAVY_MAX_MASS_KG - 1, // < max mass
  ];

  // create a package that is neither bulky nor heavy
  notBulkyNorHeavy = [
    sideLength - 1,
    sideLength,
    sideLength,
    sorter.HEAVY_MAX_MASS_KG - 1, // < max mass
  ];
});

describe("PackageSorter", () => {
  test("sort should throw if given invalid input", () => {
    // ensure non numbers throw
    // as any here just to appease TypeScript while we test invalid input
    expect(() => sorter.sort("A" as any, 2, 3, 4)).toThrow();
    expect(() => sorter.sort(1, "A" as any, 3, 4)).toThrow();
    expect(() => sorter.sort(1, 2, "A" as any, 4)).toThrow();
    expect(() => sorter.sort(1, 2, 3, "A" as any)).toThrow();

    // ensure negative numbers throw
    expect(() => sorter.sort(-1, 2, 3, 4)).toThrow();
    expect(() => sorter.sort(1, -2, 3, 4)).toThrow();
    expect(() => sorter.sort(1, 2, -3, 4)).toThrow();
    expect(() => sorter.sort(1, 2, 3, -4)).toThrow();

    // decimals are ok
    expect(() => sorter.sort(1.2, 2.1, 3.1, 4.1)).not.toThrow();
  });

  test("sort should return Stack.REJECTED if package isBulky AND isHeavy", () => {
    expect(sorter.sort(...bulkyAndHeavyExactly)).toBe(Stack.REJECTED);
    expect(sorter.sort(...bulkyAndHeavy)).toBe(Stack.REJECTED);

    expect(sorter.sort(...heavy)).not.toBe(Stack.REJECTED);
    expect(sorter.sort(...bulky)).not.toBe(Stack.REJECTED);
    expect(sorter.sort(...notBulkyNorHeavy)).not.toBe(Stack.REJECTED);
  });

  test("sort should return Stack.SPECIAL if package isBulky OR isHeavy", () => {
    expect(sorter.sort(...heavy)).toBe(Stack.SPECIAL);
    expect(sorter.sort(...bulky)).toBe(Stack.SPECIAL);

    expect(sorter.sort(...bulkyAndHeavyExactly)).not.toBe(Stack.SPECIAL);
    expect(sorter.sort(...bulkyAndHeavy)).not.toBe(Stack.SPECIAL);
    expect(sorter.sort(...notBulkyNorHeavy)).not.toBe(Stack.SPECIAL);
  });

  test("sort should return Stack.STANDARD if package is neither bulky nor heavy", () => {
    expect(sorter.sort(...notBulkyNorHeavy)).toBe(Stack.STANDARD);

    expect(sorter.sort(...heavy)).not.toBe(Stack.STANDARD);
    expect(sorter.sort(...bulky)).not.toBe(Stack.STANDARD);
    expect(sorter.sort(...bulkyAndHeavyExactly)).not.toBe(Stack.STANDARD);
    expect(sorter.sort(...bulkyAndHeavy)).not.toBe(Stack.STANDARD);
  });
});
