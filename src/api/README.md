# NES API Integration

This directory contains the integration layer for the **Nepal Entity Service (Tundikhel)** backend.

## Architecture

```
src/api/
├── api.ts              # Core API client (Axios)
├── nes-adapters.ts     # Data transformation utilities
└── README.md           # This file

src/hooks/
├── useEntityList.ts    # Hook for entity list/search
└── useEntityDetail.ts  # Hook for entity details + related data

src/components/
├── EntityListContainer.tsx    # Data container for entity list
└── EntityDetailContainer.tsx  # Data container for entity detail
```

## Environment Configuration

Set the backend URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

**Default fallback:** `http://localhost:8000/api`

## API Endpoints

### Entities

- `GET /entity` - List entities with filtering
- `GET /entity/search?q=...` - Search entities
- `GET /entity/:type/:slug` - Get entity by type and slug
- `GET /entity/:type/:slug/versions` - Get version history

### Relationships

- `GET /relationship?source_id=...` - Get relationships by source
- `GET /relationship?target_id=...` - Get relationships by target

### Allegations & Cases

- Fetched from **JDS API** (Jawafdehi/Accountability API)
- `getEntityAllegations(entityId)` - All allegations
- `getEntityCases(entityId)` - Current allegations (cases)

## Usage

### 1. Using Hooks (Recommended)

```typescript
import { useEntityList } from '@/hooks/useEntityList';
import { useEntityDetail } from '@/hooks/useEntityDetail';

// List entities
const { entities, loading, error } = useEntityList({
  query: 'rabi',
  entity_type: 'person',
  page: 1,
  limit: 100,
});

// Entity detail with all related data
const {
  entity,
  allegations,
  cases,
  relationships,
  versions,
  sources,
} = useEntityDetail({
  entityType: 'person',
  entitySlug: 'prabin-shahi',
});
```

### 2. Using Container Components

```typescript
import { EntityListContainer } from '@/components/EntityListContainer';
import { EntityDetailContainer } from '@/components/EntityDetailContainer';

// Entity list
<EntityListContainer
  query="rabi"
  entityType="person"
  page={1}
  limit={100}
/>

// Entity detail
<EntityDetailContainer
  entityType="person"
  entitySlug="prabin-shahi"
/>
```

### 3. Direct API Calls

```typescript
import {
  getEntities,
  searchEntities,
  getEntityBySlug,
  getEntityAllegations,
  getRelationships,
} from '@/api/api';

// Search
const results = await searchEntities('rabi', {
  entity_type: 'person',
  limit: 50,
});

// Get entity
const entity = await getEntityBySlug('person', 'prabin-shahi');

// Get allegations
const allegations = await getEntityAllegations(entity.slug);

// Get relationships
const rels = await getRelationships({ source_id: entity.slug });
```

## Data Adapters

### Unified Name Handling

```typescript
import { getUnifiedName } from '@/api/nes-adapters';

const name = getUnifiedName(entity, 'en'); // Returns PRIMARY name or fallback
```

### Merge Evidence & Sources

```typescript
import { mergeEvidenceAndSources } from '@/api/nes-adapters';

const sources = mergeEvidenceAndSources(entity);
// Returns unified list of evidence + attributions + references
```

## Types

All types are defined in `src/types/nes.ts`:

- `Entity` - Base entity (Person, Organization, Location)
- `Relationship` - Entity-to-entity relationship
- `VersionSummary` - Version history metadata
- `Attribution` - Source attribution
- `Name`, `NameParts` - Name structures

## Error Handling

```typescript
import { NESApiError } from '@/api/api';

try {
  const entity = await getEntityBySlug('person', 'invalid');
} catch (error) {
  if (error instanceof NESApiError) {
    console.error(`API Error [${error.statusCode}]: ${error.message}`);
  }
}
```

## Testing

Run tests:

```bash
npm test
```

Test files:
- `tests/api.test.ts` - API client unit tests
- `tests/integration.test.ts` - Full flow integration test
- `tests/nes-adapters.test.ts` - Adapter function tests

## Route Integration

Update your routes to use Tundikhel-style paths:

```typescript
// Before
<Route path="/entity/:id" element={<EntityProfile />} />

// After (Tundikhel-style)
<Route path="/entity/:type/:slug" element={<EntityProfile />} />
```

Inside components:

```typescript
const { type, slug } = useParams();
const { entity } = useEntityDetail({ entityType: type, entitySlug: slug });
```

## Migration from Old API

If migrating from `src/services/api.ts`:

1. Update imports: `@/services/api` → `@/api/api`
2. Update env var: `VITE_NES_API_BASE_URL` → `VITE_API_BASE_URL`
3. Use hooks for data fetching instead of direct API calls
4. Use container components to wrap existing UI

## References

- [NES Backend Types](https://github.com/NewNepal-org/NepalEntityService-Tundikhel/blob/main/src/common/nes-types.ts)
- [Live Reference](https://tundikhel.nes.newnepal.org)
- [Core NES](https://github.com/NewNepal-org/NepalEntityService)
