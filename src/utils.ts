export function sleep (timeMs: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(function() {
      resolve();
    }, timeMs);
  });
}
