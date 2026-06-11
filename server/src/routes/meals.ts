import { Router, Request, Response } from 'express';
import { Client } from '@notionhq/client';

const router = Router();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

router.get('/', async (req: Request, res: Response) => {
  try {
    const { date, month, year } = req.query;

    let filter: any;

    if (date) {
      filter = {
        property: 'Date',
        date: { equals: date as string }
      };
    } else if (month) {
      const [y, m] = (month as string).split('-');
      const start = `${y}-${m}-01`;
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      const end = `${y}-${m}-${lastDay}`;
      filter = {
        property: 'Date',
        date: { on_or_after: start }
      };
      // Need to also add on_or_before for month filter
      filter = {
        and: [
          { property: 'Date', date: { on_or_after: start } },
          { property: 'Date', date: { on_or_before: end } }
        ]
      };
    } else if (year) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      filter = {
        and: [
          { property: 'Date', date: { on_or_after: start } },
          { property: 'Date', date: { on_or_before: end } }
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
      name: page.properties.Name.title[0]?.plain_text || 'Untitled',
      date: page.properties.Date.date?.start || '',
      mealType: page.properties['Meal Type']?.select?.name || '',
      emoji: page.properties.Emoji?.rich_text[0]?.plain_text || '',
      notes: page.properties.Notes?.rich_text[0]?.plain_text || '',
    }));

    res.json({ meals });
  } catch (error) {
    console.error('Error querying Notion:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, date, mealType, emoji, notes } = req.body;

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: name } }]
        },
        Date: {
          date: { start: date }
        },
        'Meal Type': {
          select: { name: mealType }
        },
        Emoji: {
          rich_text: [{ text: { content: emoji } }]
        },
        Notes: {
          rich_text: [{ text: { content: notes || '' } }]
        }
      }
    });

    res.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

export { router as mealsRouter };
