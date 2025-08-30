
export class Power {

  /**
   * @param percent value between 0.0-1.0
   */
  static fromPercent(percent: number) {
    return Math.round(percent * 255);
  }

  static get full() {
    return 255;
  }

  static get threeQuarters() {
    return 192;
  }

  static get half() {
    return 128;
  }

  static get quarter() {
    return 64;
  }

  static get zero() {
    return 0;
  }
}