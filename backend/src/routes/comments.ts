import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  vulnerabilityId: z.string().min(1, 'Vulnerability ID is required')
});

// Get comments for a vulnerability
router.get('/vulnerability/:vulnerabilityId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { vulnerabilityId } = req.params;

    // Check if vulnerability exists and user has access
    const vulnerability = await prisma.vulnerabilities.findUnique({
      where: { id: vulnerabilityId },
      select: { id: true, reporterId: true }
    });

    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }

    // Check access permissions
    if (req.user!.role === 'RESEARCHER' && vulnerability.reporterId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await prisma.comments.findMany({
      where: { vulnerabilityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ comments });
  } catch (error) {
    throw error;
  }
});

// Create comment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { content, vulnerabilityId } = createCommentSchema.parse(req.body);

    // Check if vulnerability exists and user has access
    const vulnerability = await prisma.vulnerabilities.findUnique({
      where: { id: vulnerabilityId },
      select: { id: true, reporterId: true }
    });

    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }

    // Check access permissions
    if (req.user!.role === 'RESEARCHER' && vulnerability.reporterId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await prisma.comments.create({
      data: {
        content,
        vulnerabilityId,
        userId: req.user!.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    throw error;
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = z.object({ content: z.string().min(1) }).parse(req.body);

    const comment = await prisma.comments.findUnique({
      where: { id },
      include: {
        vulnerability: {
          select: { reporterId: true }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check permissions - only the comment author can edit
    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedComment = await prisma.comments.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    throw error;
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comments.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check permissions - only the comment author or admin can delete
    if (comment.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.comments.delete({
      where: { id }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    throw error;
  }
});

export default router;
