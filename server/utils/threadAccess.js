export function hasThreadAccess(thread, userId) {
  if (!thread || !userId) return false;

  return (
    thread.userId.toString() === userId.toString() ||
    thread.supplierUserId.toString() === userId.toString()
  );
}
