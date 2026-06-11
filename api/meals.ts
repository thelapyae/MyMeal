import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from '@notionhq/client';
import { verifyTelegramRequest } from './_auth';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Every data request must carry a valid, signed Telegram initData payload
  // from an authorized user. This is what actually keeps the meal log private
  // when the site is opened in a normal browser.
  const initData =
    (req.headers['x-telegram-init-data'] as string | undefined) ?? undefined;
  const auth = verifyTelegramRequest(initData);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    if (req.method === 'GET') {
      const { date, month, year } = req.query;
      let filter: any;

      if (date) {
        const d = date as string;
        filter = {
          and: [
            { property: 'Date', date: { on_or_after: `${d}T00:00:00` } },
            { property: 'Date', date: { on_or_before: `${d}T23:59:59` } }
          ]
        };
      } else if (month) {
        const [y, m] = (month as string).split('-');
        const lastDay = String(new Date(Number(y), Number(m), 0).getDate()).padStart(2, '0');
        filter = {
          and: [
            { property: 'Date', date: { on_or_after: `${y}-${m}-01T00:00:00` } },
            { property: 'Date', date: { on_or_before: `${y}-${m}-${lastDay}T23:59:59` } }
          ]
        };
      } else if (year) {
        filter = {
          and: [
            { property: 'Date', date: { on_or_after: `${year}-01-01T00:00:00` } },
            { property: 'Date', date: { on_or_before: `${year}-12-31T23:59:59` } }
          ]
        };
      }

      const response = await notion.databases.query({
        database_id: databaseId,
        ...(filter ? { filter } : {}),
        sorts: [{ property: 'Date', direction: 'descending' }]
      });

      const meals = response.results.map((page: any) => ({
        id: page.id,
        name: page.properties.Name.title[0]?.plain_text || '',
        date: page.properties.Date.date?.start || '',
        mealType: page.properties['Meal Type']?.select?.name || '',
        emoji: page.properties.Emoji?.rich_text[0]?.plain_text || '',
        notes: page.properties.Notes?.rich_text[0]?.plain_text || '',
      }));

      return res.json({ meals });
    }

    if (req.method === 'POST') {
      const { name, date, mealType, emoji, notes } = req.body;

      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Date: { date: { start: date } },
          'Meal Type': { select: { name: mealType } },
          Emoji: { rich_text: [{ text: { content: emoji } }] },
          Notes: { rich_text: [{ text: { content: notes || '' } }] },
        }
      });

      return res.json({ success: true, id: response.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notion API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
