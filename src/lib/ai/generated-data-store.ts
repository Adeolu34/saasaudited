let pendingData: Record<string, unknown> | null = null;

export function setPendingGeneratedData(data: Record<string, unknown>) {
  pendingData = data;
}

export function consumePendingGeneratedData(): Record<string, unknown> | null {
  const data = pendingData;
  pendingData = null;
  return data;
}
