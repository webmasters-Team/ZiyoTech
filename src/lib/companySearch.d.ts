export type SearchableCompany = { companyName: string };

export declare function searchCompanies<T extends SearchableCompany>(
  companies: readonly T[],
  query: string,
  limit?: number,
): T[];
