DROP DATABASE IF EXISTS biztime_mn;

CREATE DATABASE biztime_mn;

\c biztime_mn;

DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies;

CREATE TABLE companies ( code text PRIMARY KEY,
name text NOT NULL UNIQUE,
description text);


CREATE TABLE invoices
( id serial PRIMARY KEY,
comp_code text NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
amt float NOT NULL,
paid boolean DEFAULT false NOT NULL,
add_date date DEFAULT CURRENT_DATE NOT NULL,
paid_date date, CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision)));


CREATE TABLE industries ( id SERIAL PRIMARY KEY,
code TEXT NOT NULL UNIQUE,
industry TEXT NOT NULL UNIQUE);


CREATE TABLE itype
(industries_code TEXT REFERENCES industries(code) ON DELETE CASCADE,
companies_code TEXT REFERENCES companies(code) ON DELETE CASCADE,
PRIMARY KEY (industries_code, companies_code));


INSERT INTO companies
VALUES ('apple', 'Apple Computer',
'Maker of OSX.'), ('tesla',
'Tesla Cars',
'Maker of Teslas'), ('pfz',
'Pfizer',
'Maker of Drugs'), ('ibm',
'IBM',
'Big blue.');


INSERT INTO invoices (comp_Code, amt, paid, paid_date)
VALUES ('apple',
100,
false,
null), ('apple', 200,
false,
null), ('apple',
300,
true,
'2018-01-01'), ('ibm',
400,
false,
null);


INSERT INTO industries (code, industry)
VALUES ('acct',
'Accounting'), ('softw',
'Software'), ('med',
'Medical'), ('pharm',
'Pharmaceutical'), ('manuf',
'Manufacturing'), ('trans',
'Transportation');


INSERT INTO itype (industries_code,companies_code)
VALUES ('softw','apple'),
('pharm','pfz'),
('pharm','apple'),
('manuf','pfz'),
('manuf','tesla');

