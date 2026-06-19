import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import db from '../db';
import type {
  Slide,
  SlideCategory,
  PaginatedResponse,
  ApiResponse,
  CreateSlideRequest,
  UpdateSlideRequest,
} from '@casevault/types';

// ─── Zod Schemas ─────────────────────────────────────────────────────

const VALID_CATEGORIES: [SlideCategory, ...SlideCategory[]] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Operations',
  'Sustainability',
  'Other',
];

const slideQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  search: z.string().optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  sort: z.enum(['newest', 'oldest', 'views']).default('newest'),
  year: z.coerce.number().int().optional(),
});

const createSlideSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  competition_name: z.string().min(1, 'Competition name is required').max(255),
  year: z.coerce.number().int().min(1900).max(2100),
  category: z.enum(VALID_CATEGORIES),
  executive_summary: z.string().max(5000).optional(),
});

const updateSlideSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  competition_name: z.string().min(1).max(255).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  executive_summary: z.string().max(5000).nullable().optional(),
});

// ─── Multer File Types ───────────────────────────────────────────────

interface MulterFiles {
  file?: Express.Multer.File[];
  preview_image?: Express.Multer.File[];
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildSortClause(sort: 'newest' | 'oldest' | 'views'): string {
  switch (sort) {
    case 'newest':
      return 'ORDER BY created_at DESC';
    case 'oldest':
      return 'ORDER BY created_at ASC';
    case 'views':
      return 'ORDER BY views DESC';
  }
}

// ─── Controllers ─────────────────────────────────────────────────────

export function getSlides(req: Request, res: Response): void {
  try {
    const parsed = slideQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ error: errorMessage } satisfies ApiResponse<never>);
      return;
    }

    const { page, limit, search, category, sort, year } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push('(title LIKE ? OR competition_name LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (year) {
      conditions.push('year = ?');
      params.push(year);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortClause = buildSortClause(sort);

    // Count total matches
    const countSql = `SELECT COUNT(*) as total FROM slides ${whereClause}`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const total = countResult.total;

    // Fetch paginated results
    const dataSql = `SELECT * FROM slides ${whereClause} ${sortClause} LIMIT ? OFFSET ?`;
    const rows = db
      .prepare(dataSql)
      .all(...params, limit, offset) as Slide[];

    const response: PaginatedResponse<Slide> = {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function getSlideById(req: Request, res: Response): void {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Slide ID is required' } satisfies ApiResponse<never>);
      return;
    }

    // Atomically increment views and fetch the slide
    const updateStmt = db.prepare(
      'UPDATE slides SET views = views + 1 WHERE id = ?'
    );
    const result = updateStmt.run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Slide not found' } satisfies ApiResponse<never>);
      return;
    }

    const slide = db
      .prepare('SELECT * FROM slides WHERE id = ?')
      .get(id) as Slide;

    const response: ApiResponse<Slide> = { data: slide };
    res.status(200).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function createSlide(req: Request, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    const parsed = createSlideSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ error: errorMessage } satisfies ApiResponse<never>);
      return;
    }

    const files = req.files as MulterFiles | undefined;

    if (!files?.file || files.file.length === 0) {
      res.status(400).json({ error: 'PDF file is required' } satisfies ApiResponse<never>);
      return;
    }

    const { title, competition_name, year, category, executive_summary } =
      parsed.data satisfies CreateSlideRequest;

    // Store paths relative to uploads/
    const filePath = `uploads/${files.file[0].filename}`;
    const previewImage =
      files.preview_image && files.preview_image.length > 0
        ? `uploads/${files.preview_image[0].filename}`
        : null;

    const stmt = db.prepare(`
      INSERT INTO slides (user_id, title, competition_name, year, category, executive_summary, file_path, preview_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const slide = stmt.get(
      req.user.id,
      title,
      competition_name,
      year,
      category,
      executive_summary ?? null,
      filePath,
      previewImage
    ) as Slide;

    const response: ApiResponse<Slide> = { data: slide };
    res.status(201).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function updateSlide(req: Request, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Slide ID is required' } satisfies ApiResponse<never>);
      return;
    }

    // Fetch existing slide for owner check
    const existing = db
      .prepare('SELECT * FROM slides WHERE id = ?')
      .get(id) as Slide | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Slide not found' } satisfies ApiResponse<never>);
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    const parsed = updateSlideSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ error: errorMessage } satisfies ApiResponse<never>);
      return;
    }

    const updates = parsed.data;
    const setClauses: string[] = [];
    const params: (string | number | null)[] = [];

    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updates.title);
    }
    if (updates.competition_name !== undefined) {
      setClauses.push('competition_name = ?');
      params.push(updates.competition_name);
    }
    if (updates.year !== undefined) {
      setClauses.push('year = ?');
      params.push(updates.year);
    }
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(updates.category);
    }
    if (updates.executive_summary !== undefined) {
      setClauses.push('executive_summary = ?');
      params.push(updates.executive_summary ?? null);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' } satisfies ApiResponse<never>);
      return;
    }

    // Always update updated_at
    setClauses.push('updated_at = unixepoch()');

    const sql = `UPDATE slides SET ${setClauses.join(', ')} WHERE id = ? RETURNING *`;
    params.push(id);

    const slide = db.prepare(sql).get(...params) as Slide;

    const response: ApiResponse<Slide> = { data: slide };
    res.status(200).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function deleteSlide(req: Request, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Slide ID is required' } satisfies ApiResponse<never>);
      return;
    }

    const existing = db
      .prepare('SELECT * FROM slides WHERE id = ?')
      .get(id) as Slide | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Slide not found' } satisfies ApiResponse<never>);
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    // Delete files from disk
    const uploadsRoot = path.join(__dirname, '..', '..', '..');
    if (existing.file_path) {
      const absFilePath = path.join(uploadsRoot, existing.file_path);
      if (fs.existsSync(absFilePath)) {
        fs.unlinkSync(absFilePath);
      }
    }
    if (existing.preview_image) {
      const absPreviewPath = path.join(uploadsRoot, existing.preview_image);
      if (fs.existsSync(absPreviewPath)) {
        fs.unlinkSync(absPreviewPath);
      }
    }

    // Delete from database
    db.prepare('DELETE FROM slides WHERE id = ?').run(id);

    res.status(200).json({ data: { message: 'Deleted' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}
