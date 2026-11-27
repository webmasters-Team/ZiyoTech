import test from 'node:test';
import assert from 'node:assert/strict';
import { searchCompanies } from '../src/lib/companySearch.js';

test('company search returns the newest-first first six when the query is empty', () => {
  const companies = Array.from({ length: 8 }, (_, index) => ({ id: String(index), companyName: `Company ${index}` }));

  assert.deepEqual(searchCompanies(companies, '').map(({ id }) => id), ['0', '1', '2', '3', '4', '5']);
});

test('company search scans all records and ranks the closest name first', () => {
  const companies = [
    { id: 'substring', companyName: 'Northwind Acme Studio' },
    { id: 'prefix', companyName: 'Acme Global' },
    { id: 'exact', companyName: 'Acme' },
    { id: 'word-prefix', companyName: 'Studio Acme Partners' },
    ...Array.from({ length: 7 }, (_, index) => ({ id: `other-${index}`, companyName: `Other ${index}` })),
    { id: 'late-match', companyName: 'Acme Enterprise' },
  ];

  assert.deepEqual(searchCompanies(companies, ' acme ').map(({ id }) => id), [
    'exact', 'prefix', 'late-match', 'word-prefix', 'substring',
  ]);
});

test('company search caps matching results and remains case insensitive', () => {
  const companies = Array.from({ length: 9 }, (_, index) => ({ id: String(index), companyName: `ZiyoTech ${index}` }));

  assert.deepEqual(searchCompanies(companies, 'ZIYOTECH', 6).map(({ id }) => id), ['0', '1', '2', '3', '4', '5']);
});

test('company search finds a company by any associated project name', () => {
  const companies = [
    { id: 'company-a', companyName: 'Alpha Company', projectNames: ['Storefront Renewal', 'Mobile App'] },
    { id: 'company-b', companyName: 'Storefront Works', projectNames: ['Internal Tools'] },
  ];

  assert.deepEqual(searchCompanies(companies, 'storefront').map(({ id }) => id), ['company-b', 'company-a']);
});
