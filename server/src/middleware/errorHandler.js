export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

// Express identifies error-handling middleware by its 4-parameter signature.
export function errorHandler(err, _req, res, _next) {
  if (res.headersSent) {
    return _next(err);
  }

  if (
    (err instanceof SyntaxError && err.status === 400 && 'body' in err) ||
    err.type === 'entity.parse.failed'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }

  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large',
    });
  }

  const rawStatus = err.status || err.statusCode;
  const statusCode =
    Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
      ? rawStatus
      : 500;

  if (statusCode >= 500) {
    console.error('Unexpected server error');
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? 'Internal server error'
        : err.message || 'Request failed',
  });
}
