export const parsePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const size = Math.min(20, Math.max(1, parseInt(query.size, 10) || 10));
  const skip = (page - 1) * size;
  return { page, size, skip };
};

export const buildPaginatedResponse = (data, total, page, size) => {
  const totalPages = Math.ceil(total / size);
  return {
    data,
    pagination: {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};