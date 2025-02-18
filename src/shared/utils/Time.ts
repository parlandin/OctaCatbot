export class Timer {
  private startTime: number | null = null;

  start(): Timer {
    this.startTime = performance.now();
    return this;
  }

  end(): string {
    if (!this.startTime) {
      throw new Error("Timer não foi iniciado. Chame start() primeiro.");
    }

    const endTime = performance.now();
    const elapsedTime = endTime - this.startTime;
    this.startTime = null;

    return this.formatTime(elapsedTime);
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
}
