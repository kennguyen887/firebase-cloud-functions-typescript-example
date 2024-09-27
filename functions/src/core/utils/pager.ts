
export function getOffset(pageIndex: number, pageSize: number): number {
    return Math.max(0, (pageIndex - 1) * pageSize); // Ensures the offset is non-negative
  }