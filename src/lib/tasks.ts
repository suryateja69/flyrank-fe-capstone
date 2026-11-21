export const statuses = ['todo', 'inprogress', 'done'] as const;
export const priorities = ['low', 'medium', 'high'] as const;
export type Task = { id: string; title: string; status: typeof statuses[number]; priority: typeof priorities[number] };
export const statusLabels = { todo: 'To do', inprogress: 'In progress', done: 'Done' };
export const STORAGE_KEY = 'taskflow.tasks.v1';
export function validTitle(title: string) { return title.trim().length > 0 && title.trim().length <= 120; }
export function parseTasks(raw: string | null): Task[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(t => t && typeof t.id === 'string' && t.id.length > 0 && typeof t.title === 'string' && validTitle(t.title) && statuses.includes(t.status) && priorities.includes(t.priority)) || new Set(data.map(t => t.id)).size !== data.length) throw new Error('Invalid saved tasks');
  return data.map(t => ({ id: t.id, title: t.title.trim(), status: t.status, priority: t.priority }));
}
