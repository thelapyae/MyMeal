import type { Meal } from '../types';
import { getInitData } from '../telegram';

const BASE = '/api/meals';

function authHeaders(): Record<string, string> {
  return { 'X-Telegram-Init-Data': getInitData() };
}

export async function fetchMeals(params: { date?: string; month?: string; year?: string }): Promise<Meal[]> {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.month) query.set('month', params.month);
  if (params.year) query.set('year', params.year);

  const res = await fetch(`${BASE}?${query}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch meals');
  const data = await res.json();
  return data.meals;
}

export async function createMeal(meal: {
  name: string;
  date: string;
  mealType: string;
  emoji: string;
  notes?: string;
}): Promise<void> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(meal),
  });
  if (!res.ok) throw new Error('Failed to create meal');
}
