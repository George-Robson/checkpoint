export function employeeKey(tenantId: string, name: string): string {
  return `${tenantId}:${name}`;
}
