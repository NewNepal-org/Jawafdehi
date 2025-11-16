# NES API Integration

This directory contains the API client and adapters for the Nepal Entity Service (NES) backend integration.

## Files

- **`api.ts`** - Main API client with typed functions for all NES endpoints
- **`nes-adapters.ts`** - Data transformation utilities (e.g., merging evidence and sources)
- **`README.md`** - This file

## Environment Variables

Set the backend API URL in your `.env` file:

```env
VITE_NES_API_BASE_URL=https://nes.newnepal.org/api
```

**Default:** `https://nes.newnepal.org/api`

For local development:
```env
VITE_NES_API_BASE_URL=http://localhost:8000/api
```

## API Reference

### Entity Endpoints

#### `getEntities(params?)`
Get list of entities with optional filters.

```typescript
import { getEntities } from '@/services/api';

const result = await getEntities({
  type: 'person',
  page: 1,
  limit: 20
});
```

**Parameters:**
- `type?: string` - Filter by entity type (person, organization, location)
- `sub_type?: string` - Filter by entity subtype
- `page?: number` - Page number (1-indexed)
- `limit?: number` - Results per page (default: 20)

**Response:** `EntityListResponse`
```typescript
{
  entities: Entity[],
  total?: number,
  page?: number,
  limit?: number,
  has_more?: boolean
}
```

---

#### `searchEntities(query, params?)`
Search entities by query string.

```typescript
const results = await searchEntities('ram bahadur', {
  type: 'person',
  page: 1,
  limit: 10
});
```

**Parameters:**
- `query: string` - Search query
- `params?: EntitySearchParams` - Additional filters (type, sub_type, page, limit)

**Backend Request:**
```
GET /entity?q=ram+bahadur&type=person&page=1&limit=10
```

**Response:** `EntityListResponse`

---

#### `getEntityById(idOrSlug)`
Get single entity by ID or slug.

```typescript
const entity = await getEntityById('pushpa-kamal-dahal-prachanda');
```

**Backend Request:**
```
GET /entity/pushpa-kamal-dahal-prachanda
```

**Response:** `Entity`

---

#### `getEntityVersions(idOrSlug)`
Get version history for an entity.

```typescript
const versions = await getEntityVersions('pushpa-kamal-dahal-prachanda');
```

**Backend Request:**
```
GET /entity/pushpa-kamal-dahal-prachanda/versions
```

**Response:** `VersionListResponse`

---

### Relationship Endpoints

#### `getRelationships(params?)`
Get relationships with optional filters.

```typescript
// Get relationships where entity is source
const sourceRels = await getRelationships({
  source_id: 'entity-slug'
});

// Get relationships where entity is target
const targetRels = await getRelationships({
  target_id: 'entity-slug'
});

// Get all relationships for an entity
const allRels = [
  ...(await getRelationships({ source_id: 'entity-slug' })).relationships,
  ...(await getRelationships({ target_id: 'entity-slug' })).relationships
];
```

**Parameters:**
- `source_id?: string` - Filter by source entity
- `target_id?: string` - Filter by target entity
- `type?: string` - Filter by relationship type

**Backend Request:**
```
GET /relationship?source_id=entity-slug
GET /relationship?target_id=entity-slug
```

**Response:** `RelationshipListResponse`

---

### PAP-Specific Endpoints

#### `getEntityAllegations(idOrSlug)`
Get allegations for an entity.

**⚠️ Note:** This endpoint is not yet implemented in the backend. Currently returns mock data.

```typescript
const allegations = await getEntityAllegations('entity-slug');
```

**TODO:** Update to use real endpoint when available:
```
GET /entity/{id}/allegations
```

---

#### `getEntityCases(idOrSlug)`
Get cases for an entity.

**⚠️ Note:** This endpoint is not yet implemented in the backend. Currently returns mock data.

```typescript
const cases = await getEntityCases('entity-slug');
```

**TODO:** Update to use real endpoint when available:
```
GET /entity/{id}/cases
```

---

### Health Check

#### `healthCheck()`
Check API health.

```typescript
const health = await healthCheck();
```

**Backend Request:**
```
GET /health
```

---

## Data Adapters

### Evidence & Sources Merger

The `mergeEvidenceAndSources()` function combines entity attributions into a unified "Evidence & Sources" list for UI display.

```typescript
import { mergeEvidenceAndSources } from '@/services/nes-adapters';

const entity = await getEntityById('some-slug');
const sources = mergeEvidenceAndSources(entity);

sources.forEach(source => {
  console.log(`${source.title} (${source.type}): ${source.url}`);
});
```

**Source Types:**
- `document` - PDF, Word, or other documents
- `article` - News articles or blog posts
- `photo` - Images
- `video` - Video content
- `legal_record` - Court records, legal documents
- `letter` - Letters or correspondence
- `report` - Official reports
- `website` - General websites
- `other` - Other types

**Helper Functions:**
- `formatSourceType(type)` - Format type for display
- `groupSourcesByType(sources)` - Group sources by type
- `sortSourcesByDate(sources)` - Sort by publication date

---

## Example cURL Requests

### Search Entities
```bash
curl -X GET "http://localhost:8000/api/entity?q=ram&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get Entity by Slug
```bash
curl -X GET "http://localhost:8000/api/entity/pushpa-kamal-dahal-prachanda" \
  -H "Content-Type: application/json"
```

### Get Entity Versions
```bash
curl -X GET "http://localhost:8000/api/entity/pushpa-kamal-dahal-prachanda/versions" \
  -H "Content-Type: application/json"
```

### Get Relationships
```bash
# As source
curl -X GET "http://localhost:8000/api/relationship?source_id=entity-slug" \
  -H "Content-Type: application/json"

# As target
curl -X GET "http://localhost:8000/api/relationship?target_id=entity-slug" \
  -H "Content-Type: application/json"
```

### Filter by Type
```bash
curl -X GET "http://localhost:8000/api/entity?type=person&page=1&limit=20" \
  -H "Content-Type: application/json"
```

---

## Error Handling

All API functions throw `NESApiError` on failure:

```typescript
import { NESApiError } from '@/services/api';

try {
  const entity = await getEntityById('some-slug');
} catch (error) {
  if (error instanceof NESApiError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
    console.error(`Endpoint: ${error.endpoint}`);
  }
}
```

---

## Type Definitions

All types are imported from `/src/types/nes.ts`, which is an exact copy of the backend's `nes-types.ts`.

**Key Types:**
- `Entity` - Base entity interface (Person | Organization | Location)
- `Person` - Person entity
- `Organization` - Organization entity
- `Location` - Location entity
- `Relationship` - Entity relationship
- `Name` - Multilingual name with parts
- `Contact` - Contact information
- `Attribution` - Source attribution

See `/src/types/nes.ts` for complete type definitions.

---

## References

- **Backend Types:** https://github.com/NewNepal-org/NepalEntityService-Tundikhel/blob/main/src/common/nes-types.ts
- **Live Reference:** https://tundikhel.nes.newnepal.org
- **Core NES:** https://github.com/NewNepal-org/NepalEntityService

---

## Migration Notes

### From Old API to New API

**Old Way (custom types):**
```typescript
const entity = await getEntityById(id);
const name = entity.names.PRIMARY; // ❌ Wrong structure
```

**New Way (NES types):**
```typescript
import { getPrimaryName } from '@/utils/nes-helpers';

const entity = await getEntityById(id);
const name = getPrimaryName(entity.names, 'en'); // ✅ Correct
```

### Field Mapping

| Old Field | New Field | Helper Function |
|-----------|-----------|----------------|
| `entity.names.PRIMARY` | `entity.names[0]` (kind='PRIMARY') | `getPrimaryName(names, 'en')` |
| `entity.names.NEPALI` | `entity.names[0].ne?.full` | `getPrimaryName(names, 'ne')` |
| `entity.contacts.email` | `entity.contacts[0]` (type='EMAIL') | `getEmail(contacts)` |
| `entity.contacts.phone` | `entity.contacts[0]` (type='PHONE') | `getPhone(contacts)` |
| `entity.descriptions.ENGLISH` | `entity.description?.en?.value` | `getDescription(description, 'en')` |
| `entity.subtype` | `entity.sub_type` | Direct access |
| `rel.source_id` | `rel.source_entity_id` | Direct access |
| `rel.target_id` | `rel.target_entity_id` | Direct access |

### Helper Functions

Use helper functions from `/src/utils/nes-helpers.ts`:
- `getPrimaryName(names, lang)` - Get primary name
- `getEmail(contacts)` - Get email contact
- `getPhone(contacts)` - Get phone contact
- `getWebsite(contacts)` - Get website URL
- `getDescription(description, lang)` - Get description text
- `getAttribute(entity, key)` - Get custom attribute
- `formatSubType(subType)` - Format subtype for display
