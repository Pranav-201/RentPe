import { PAGINATION } from "../config/constants.js";

export function getPaginationParams(query) {
  let page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export async function paginate(query, page, limit, skip) {
  const data = await query.skip(skip).limit(limit);
  const total = await query.model.countDocuments(query.getFilter());
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
}
