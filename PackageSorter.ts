import { z } from "zod";

export const Stack = {
  STANDARD: "STANDARD",
  SPECIAL: "SPECIAL",
  REJECTED: "REJECTED",
} as const;

export type StackKey = keyof typeof Stack;

export class PackageSorter {
  readonly BULKY_MAX_VOLUME_CM = 1000000;
  readonly BULKY_MAX_DIMENSION_LENGTH_CM = 150;
  readonly HEAVY_MAX_MASS_KG = 20;

  // validate input to ensure all inputs are positive numbers
  private validateInput(
    width: number,
    height: number,
    length: number,
    mass: number,
  ) {
    const sortSchema = z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      length: z.number().positive(),
      mass: z.number().positive(),
    });

    sortSchema.parse({ width, height, length, mass });
  }

  // calculate the volume of the package
  private volume(width: number, height: number, length: number) {
    return width * height * length;
  }

  // determine if any side of the package exceeds the maximum dimension length
  private exceedsMaxDimension(width: number, height: number, length: number) {
    return [width, height, length].some(
      (dimension) => dimension >= this.BULKY_MAX_DIMENSION_LENGTH_CM,
    );
  }

  // determine if the volume of the package exceeds the maximum volume
  private exceedsMaxVolume(width: number, height: number, length: number) {
    return this.volume(width, height, length) >= this.BULKY_MAX_VOLUME_CM;
  }

  // determine if the package is bulky
  private isBulky(width: number, height: number, length: number) {
    return (
      this.exceedsMaxVolume(width, height, length) ||
      this.exceedsMaxDimension(width, height, length)
    );
  }

  // determine if the package is heavy
  private isHeavy(mass: number) {
    return mass >= this.HEAVY_MAX_MASS_KG;
  }

  // sort the package based on its dimensions and mass
  public sort(
    width: number,
    height: number,
    length: number,
    mass: number,
  ): StackKey {
    this.validateInput(width, height, length, mass);

    const isBulkyPackage = this.isBulky(width, height, length);
    const isHeavyPackage = this.isHeavy(mass);

    if (isBulkyPackage && isHeavyPackage) {
      return Stack.REJECTED;
    } else if (isBulkyPackage || isHeavyPackage) {
      return Stack.SPECIAL;
    } else {
      return Stack.STANDARD;
    }
  }
}
