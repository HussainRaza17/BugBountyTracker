import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createVulnerabilitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  asset: z.string().min(1, 'Asset is required'),
  stepsToReproduce: z.string().min(1, 'Steps to reproduce is required'),
  cvssScore: z.number().min(0).max(10, 'CVSS score must be between 0 and 10')
});

const updateVulnerabilitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  asset: z.string().min(1).optional(),
  stepsToReproduce: z.string().min(1).optional(),
  cvssScore: z.number().min(0).max(10).optional(),
  status: z.enum(['REPORTED', 'VERIFIED', 'FIXED']).optional()
});

// Get all vulnerabilities with filtering and pagination
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      severity,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (req.user!.role === 'RESEARCHER') {
      where.reporterId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    if (severity) {
      const severityNum = parseFloat(severity as string);
      if (severityNum >= 7) {
        where.cvssScore = { gte: 7 };
      } else if (severityNum >= 4) {
        where.cvssScore = { gte: 4, lt: 7 };
      } else {
        where.cvssScore = { lt: 4 };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { asset: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [vulnerabilities, total] = await Promise.all([
      prisma.vulnerabilities.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              comments: true,
              attachments: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.vulnerabilities.count({ where })
    ]);

    res.json({
      vulnerabilities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    throw error;
  }
});

// Get single vulnerability
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const vulnerability = await prisma.vulnerabilities.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }

    // Check access permissions
    if (req.user!.role === 'RESEARCHER' && vulnerability.reporterId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ vulnerability });
  } catch (error) {
    throw error;
  }
});

// Create vulnerability
router.post('/', authenticateToken, uploadMultiple, async (req: AuthRequest, res) => {
  try {
    const data = createVulnerabilitySchema.parse(req.body);

    const vulnerability = await prisma.vulnerabilities.create({
      data: {
        title: data.title,
        description: data.description,
        asset: data.asset,
        stepsToReproduce: data.stepsToReproduce,
        cvssScore: data.cvssScore,
        reporterId: req.user!.id
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Handle file uploads
    if (req.files && Array.isArray(req.files)) {
      const attachments = await Promise.all(
        req.files.map(async (file: Express.Multer.File) => {
          return prisma.attachments.create({
            data: {
              fileName: file.originalname,
              fileUrl: `/uploads/${file.filename}`,
              fileSize: file.size,
              mimeType: file.mimetype,
              vulnerabilityId: vulnerability.id
            }
          });
        })
      );

      (vulnerability as any).attachments = attachments;
    }

    res.status(201).json({
      message: 'Vulnerability created successfully',
      vulnerability
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

// Update vulnerability
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateVulnerabilitySchema.parse(req.body);

    // Check if vulnerability exists
    const existingVulnerability = await prisma.vulnerabilities.findUnique({
      where: { id }
    });

    if (!existingVulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }

    // Check permissions
    if (req.user!.role === 'RESEARCHER' && existingVulnerability.reporterId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only admins can change status
    if (data.status && req.user!.role !== 'ADMIN') {
      delete data.status;
    }

    const vulnerability = await prisma.vulnerabilities.update({
      where: { id },
      data,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    res.json({
      message: 'Vulnerability updated successfully',
      vulnerability
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

// Delete vulnerability
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const vulnerability = await prisma.vulnerabilities.findUnique({
      where: { id }
    });

    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }

    // Check permissions
    if (req.user!.role === 'RESEARCHER' && vulnerability.reporterId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.vulnerabilities.delete({
      where: { id }
    });

    res.json({ message: 'Vulnerability deleted successfully' });
  } catch (error) {
    throw error;
  }
});

// Get analytics (admin only)
router.get('/analytics/overview', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalVulnerabilities,
      vulnerabilitiesByStatus,
      vulnerabilitiesBySeverity,
      recentVulnerabilities,
      topReporters
    ] = await Promise.all([
      prisma.vulnerabilities.count(),
      prisma.vulnerabilities.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.vulnerabilities.groupBy({
        by: ['cvssScore'],
        _count: { cvssScore: true },
        orderBy: { cvssScore: 'desc' }
      }),
      prisma.vulnerabilities.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.user.findMany({
        where: { role: 'RESEARCHER' },
        include: {
          _count: {
            select: { vulnerabilities: true }
          }
        },
        orderBy: {
          vulnerabilities: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      totalVulnerabilities,
      vulnerabilitiesByStatus,
      vulnerabilitiesBySeverity,
      recentVulnerabilities,
      topReporters
    });
  } catch (error) {
    throw error;
  }
});

export default router;
