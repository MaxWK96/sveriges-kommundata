# Guide för att använda riktig data

Denna guide beskriver hur du sätter upp och använder riktig data i projektet.

## Databas setup

1. Skapa följande tabell i Supabase:

```sql
create table municipalities (
  id serial primary key,
  name text not null,
  county text not null,
  population integer not null,
  population_density float,
  area_km2 float,
  safety_score float not null,
  school_rating float not null,
  employment_rate float not null,
  price_per_sqm integer not null,
  utrikes_fodda integer,
  tva_utrikes_foraldrar integer,
  en_utrikes_foraldrar integer,
  tva_inrikes_foraldrar integer,
  utlandsk_bakgrund_total integer,
  procent_utlandsk_bakgrund float,
  top_fodelselander text
);
```

2. Importera data via Supabase Dashboard eller API

## Datakällor

- SCB (Statistiska centralbyrån)
- Brottsförebyggande rådet (BRÅ)
- Skolverket
- Arbetsförmedlingen
- Hemnet

## API-endpoints

- `GET /api/municipalities` - Hämta alla kommuner
- `GET /api/municipalities/[id]` - Hämta specifik kommun

## Datamodell

Se `types/index.ts` för den fullständiga TypeScript-definitionen av datamodellen.