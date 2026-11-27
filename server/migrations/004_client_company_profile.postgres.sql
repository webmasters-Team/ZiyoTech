-- Add the extended company profile fields used by Project Management.
ALTER TABLE client_companies ADD COLUMN website TEXT NOT NULL DEFAULT '';
ALTER TABLE client_companies ADD COLUMN industry TEXT NOT NULL DEFAULT '';
ALTER TABLE client_companies ADD COLUMN internal_notes TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX idx_client_companies_unique_name ON client_companies (LOWER(BTRIM(company_name)));
