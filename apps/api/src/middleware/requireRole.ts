// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Role-Based Access Control
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';

/**
 * Require the authenticated user to have one of the specified roles.
 * Must be used after authenticate middleware.
 *
 * Usage:
 *   router.post('/approve', authenticate, requireRole('EDITOR', 'ADMIN'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required', code: 'UNAUTHORIZED' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`,
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * Validate that a field expert is only approving comments within their approved field.
 * CRITICAL: This check runs server-side — never trust the client.
 *
 * Requires: authenticate middleware + comment's requiredField to be loaded and attached to req
 * Attach the comment's requiredField to req.commentField before using this middleware.
 */
export function validateFieldBoundary(
  req: Request & { commentField?: string | null },
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required', code: 'UNAUTHORIZED' });
    return;
  }

  const { fieldExpertProfile } = req.user;

  if (!fieldExpertProfile) {
    res.status(403).json({
      success: false,
      error: 'Field expert profile not found',
      code: 'FORBIDDEN',
    });
    return;
  }

  const commentField = req.commentField;

  // If the comment has no required field, allow (not all content is field-gated)
  if (!commentField) {
    next();
    return;
  }

  if (fieldExpertProfile.approvedField !== commentField) {
    res.status(403).json({
      success: false,
      error: `Field boundary violation: you are approved for "${fieldExpertProfile.approvedField}" but this comment requires "${commentField}"`,
      code: 'FIELD_BOUNDARY_VIOLATION',
    });
    return;
  }

  next();
}
