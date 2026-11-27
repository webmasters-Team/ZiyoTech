/**
 * Return the first company records for an optional name query.
 * Unfiltered results preserve the server's newest-first order. Matches are
 * ranked by exact name, prefix, word prefix, then substring position.
 *
 * @template { { companyName: string, projectNames?: readonly string[] } } T
 * @param {readonly T[]} companies
 * @param {string} query
 * @param {number} limit
 * @returns {T[]}
 */
export function searchCompanies(companies, query, limit = 6) {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
  const maxResults = Math.max(0, Math.floor(Number(limit) || 0));
  if (!normalizedQuery) return companies.slice(0, maxResults);

  return companies
    .map((company, index) => {
      const normalizedName = String(company.companyName || '').trim().toLocaleLowerCase();
      const matchIndex = normalizedName.indexOf(normalizedQuery);
      const matchingProjectNames = (company.projectNames || []).map((name) => String(name || '').trim().toLocaleLowerCase());
      const projectMatch = matchingProjectNames
        .map((name) => ({ name, index: name.indexOf(normalizedQuery) }))
        .filter((match) => match.index >= 0)
        .map((match) => ({ ...match, rank: match.name === normalizedQuery ? 0.5 : match.index === 0 ? 1.5 : new RegExp(`(?:^|\\s)${escapeRegExp(normalizedQuery)}`).test(match.name) ? 2.5 : 3.5 }))
        .sort((a, b) => a.rank - b.rank || a.index - b.index || Math.abs(a.name.length - normalizedQuery.length) - Math.abs(b.name.length - normalizedQuery.length))[0];
      if (matchIndex < 0 && !projectMatch) return null;

      const rank = matchIndex < 0
        ? projectMatch.rank
        : normalizedName === normalizedQuery
        ? 0
        : matchIndex === 0
          ? 1
          : new RegExp(`(?:^|\\s)${escapeRegExp(normalizedQuery)}`).test(normalizedName)
            ? 2
            : 3;
      return { company, index, rank, matchIndex: matchIndex < 0 ? projectMatch.index : matchIndex, lengthDelta: Math.abs((matchIndex < 0 ? projectMatch.name : normalizedName).length - normalizedQuery.length) };
    })
    .filter((match) => match !== null)
    .sort((a, b) => a.rank - b.rank || a.matchIndex - b.matchIndex || a.lengthDelta - b.lengthDelta || a.index - b.index)
    .slice(0, maxResults)
    .map((match) => match.company);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
