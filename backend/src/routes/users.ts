import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = '1', limit = '10', role, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              vulnerabilities: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
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

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vulnerabilities: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    throw error;
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [
      totalVulnerabilities,
      vulnerabilitiesByStatus,
      vulnerabilitiesBySeverity,
      recentActivity
    ] = await Promise.all([
      prisma.vulnerabilities.count({
        where: { reporterId: userId }
      }),
      prisma.vulnerabilities.groupBy({
        by: ['status'],
        where: { reporterId: userId },
        _count: { status: true }
      }),
      prisma.vulnerabilities.groupBy({
        by: ['cvssScore'],
        where: { reporterId: userId },
        _count: { cvssScore: true },
        orderBy: { cvssScore: 'desc' }
      }),
      prisma.vulnerabilities.findMany({
        where: { reporterId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          cvssScore: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      totalVulnerabilities,
      vulnerabilitiesByStatus,
      vulnerabilitiesBySeverity,
      recentActivity
    });
  } catch (error) {
    throw error;
  }
});

// Get leaderboard (admin only)
router.get('/leaderboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter: any = {};
    if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { gte: oneMonthAgo } };
    } else if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: oneWeekAgo } };
    }

    const leaderboard = await prisma.user.findMany({
      where: {
        role: 'RESEARCHER',
        vulnerabilities: {
          some: dateFilter
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            vulnerabilities: {
              where: dateFilter
            }
          }
        },
        vulnerabilities: {
          where: dateFilter,
          select: {
            cvssScore: true,
            status: true
          }
        }
      },
      orderBy: {
        vulnerabilities: {
          _count: 'desc'
        }
      },
      take: 20
    });

    // Calculate weighted scores
    const leaderboardWithScores = leaderboard.map(user => {
      const totalScore = user.vulnerabilities.reduce((sum, vuln) => {
        let weight = 1;
        if (vuln.status === 'VERIFIED') weight = 1.2;
        if (vuln.status === 'FIXED') weight = 1.5;
        return sum + (vuln.cvssScore * weight);
      }, 0);

      return {
        ...user,
        totalScore: Math.round(totalScore * 100) / 100,
        vulnerabilityCount: user._count.vulnerabilities
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    res.json({ leaderboard: leaderboardWithScores });
  } catch (error) {
    throw error;
  }
});

export default router;
