# NES API Examples

This document provides practical examples for testing the NES API integration.

## Environment Setup

Set your API base URL in `.env`:

```env
VITE_API_BASE_URL=https://nes.newnepal.org/api
```

For local development:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## cURL Examples

### 1. Search Entities

**Search for entities named "Ram":**
```bash
curl -X GET "https://nes.newnepal.org/api/entity?q=ram&page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Search for person entities:**
```bash
curl -X GET "https://nes.newnepal.org/api/entity?q=pushpa&type=person&page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Search for organizations:**
```bash
curl -X GET "https://nes.newnepal.org/api/entity?type=organization&page=1&limit=20" \
  -H "Content-Type: application/json"
```

---

### 2. Get Entity by Slug

**Get specific entity:**
```bash
curl -X GET "https://nes.newnepal.org/api/entity/pushpa-kamal-dahal-prachanda" \
  -H "Content-Type: application/json"
```

---

### 3. Get Entity Versions

**Get version history:**
```bash
curl -X GET "https://nes.newnepal.org/api/entity/pushpa-kamal-dahal-prachanda/versions" \
  -H "Content-Type: application/json"
```

---

### 4. Get Relationships

**Get relationships where entity is the source:**
```bash
curl -X GET "https://nes.newnepal.org/api/relationship?source_id=pushpa-kamal-dahal-prachanda" \
  -H "Content-Type: application/json"
```

**Get relationships where entity is the target:**
```bash
curl -X GET "https://nes.newnepal.org/api/relationship?target_id=cpn-maoist-centre" \
  -H "Content-Type: application/json"
```

**Filter relationships by type:**
```bash
curl -X GET "https://nes.newnepal.org/api/relationship?source_id=pushpa-kamal-dahal-prachanda&type=MEMBER_OF" \
  -H "Content-Type: application/json"
```

---

### 5. Health Check

```bash
curl -X GET "https://nes.newnepal.org/api/health" \
  -H "Content-Type: application/json"
```

---

## TypeScript/JavaScript Examples

### Search and Display Entities

```typescript
import { searchEntities } from '@/services/api';
import { getPrimaryName } from '@/utils/nes-helpers';

async function searchAndDisplay(query: string) {
  try {
    const results = await searchEntities(query, {
      type: 'person',
      page: 1,
      limit: 10
    });

    console.log(`Found ${results.total || 0} entities`);

    results.entities.forEach(entity => {
      const name = getPrimaryName(entity.names, 'en');
      console.log(`- ${name} (${entity.type})`);
    });
  } catch (error) {
    console.error('Search failed:', error);
  }
}

searchAndDisplay('ram');
```

---

### Get Entity with Full Details

```typescript
import { 
  getEntityById, 
  getRelationships, 
  getEntityVersions 
} from '@/services/api';
import { 
  getPrimaryName, 
  getEmail, 
  getDescription 
} from '@/utils/nes-helpers';
import { mergeEvidenceAndSources } from '@/services/nes-adapters';

async function getFullEntityProfile(slug: string) {
  try {
    // Get entity
    const entity = await getEntityById(slug);
    
    // Get related data
    const [sourceRels, targetRels, versions] = await Promise.all([
      getRelationships({ source_id: entity.id }),
      getRelationships({ target_id: entity.id }),
      getEntityVersions(entity.id)
    ]);

    // Extract useful information
    const profile = {
      name: getPrimaryName(entity.names, 'en'),
      nameNe: getPrimaryName(entity.names, 'ne'),
      type: entity.type,
      subType: entity.sub_type,
      email: getEmail(entity.contacts),
      description: getDescription(entity.description, 'en'),
      relationships: [
        ...sourceRels.relationships,
        ...targetRels.relationships
      ],
      versions: versions.versions,
      sources: mergeEvidenceAndSources(entity)
    };

    console.log('Entity Profile:', profile);
    return profile;
  } catch (error) {
    console.error('Failed to load entity:', error);
    throw error;
  }
}

getFullEntityProfile('pushpa-kamal-dahal-prachanda');
```

---

### Handle Evidence and Sources

```typescript
import { getEntityById } from '@/services/api';
import { 
  mergeEvidenceAndSources,
  formatSourceType,
  sortSourcesByDate 
} from '@/services/nes-adapters';

async function displayEntitySources(slug: string) {
  const entity = await getEntityById(slug);
  const sources = mergeEvidenceAndSources(entity);
  const sorted = sortSourcesByDate(sources);

  console.log(`\nSources for ${entity.slug}:\n`);

  sorted.forEach(source => {
    console.log(`[${formatSourceType(source.type)}] ${source.title}`);
    if (source.description) {
      console.log(`  ${source.description}`);
    }
    if (source.url) {
      console.log(`  URL: ${source.url}`);
    }
    if (source.published_date) {
      console.log(`  Published: ${source.published_date}`);
    }
    console.log('');
  });
}

displayEntitySources('pushpa-kamal-dahal-prachanda');
```

---

### Error Handling

```typescript
import { getEntityById, NESApiError } from '@/services/api';

async function safeGetEntity(slug: string) {
  try {
    const entity = await getEntityById(slug);
    return entity;
  } catch (error) {
    if (error instanceof NESApiError) {
      console.error(`API Error (${error.statusCode}): ${error.message}`);
      console.error(`Endpoint: ${error.endpoint}`);
      
      if (error.statusCode === 404) {
        console.log('Entity not found. Try another slug.');
      } else if (error.statusCode === 500) {
        console.log('Server error. Please try again later.');
      }
    } else {
      console.error('Unknown error:', error);
    }
    return null;
  }
}
```

---

## Postman Collection

Import this JSON into Postman for quick API testing:

```json
{
  "info": {
    "name": "Nepal Entity Service API",
    "description": "Collection for testing NES API endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://nes.newnepal.org/api",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Search Entities",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/entity?q=ram&page=1&limit=10",
          "host": ["{{base_url}}"],
          "path": ["entity"],
          "query": [
            {"key": "q", "value": "ram"},
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Get Entity by Slug",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/entity/pushpa-kamal-dahal-prachanda",
          "host": ["{{base_url}}"],
          "path": ["entity", "pushpa-kamal-dahal-prachanda"]
        }
      }
    },
    {
      "name": "Get Entity Versions",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/entity/pushpa-kamal-dahal-prachanda/versions",
          "host": ["{{base_url}}"],
          "path": ["entity", "pushpa-kamal-dahal-prachanda", "versions"]
        }
      }
    },
    {
      "name": "Get Relationships (Source)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/relationship?source_id=pushpa-kamal-dahal-prachanda",
          "host": ["{{base_url}}"],
          "path": ["relationship"],
          "query": [
            {"key": "source_id", "value": "pushpa-kamal-dahal-prachanda"}
          ]
        }
      }
    },
    {
      "name": "Get Relationships (Target)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/relationship?target_id=cpn-maoist-centre",
          "host": ["{{base_url}}"],
          "path": ["relationship"],
          "query": [
            {"key": "target_id", "value": "cpn-maoist-centre"}
          ]
        }
      }
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    }
  ]
}
```

Save this as `NES_API.postman_collection.json` and import into Postman.

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] Health check returns 200
- [ ] Search with query returns results
- [ ] Get entity by slug returns entity details
- [ ] Get relationships returns related entities
- [ ] Get versions returns version history

### ✅ Error Handling
- [ ] Search with no results returns empty array
- [ ] Get nonexistent entity returns 404
- [ ] Invalid parameters return appropriate errors

### ✅ Data Integrity
- [ ] Entity names are properly structured
- [ ] Contacts are accessible via helper functions
- [ ] Relationships use correct field names (source_entity_id, target_entity_id)
- [ ] Descriptions are multilingual
- [ ] Attributions are merged into sources

### ✅ Performance
- [ ] Searches complete within reasonable time
- [ ] Parallel requests work correctly
- [ ] Pagination works as expected

---

## Common Issues & Solutions

### Issue: "Entity not found"
**Solution:** Verify the entity slug is correct. Use search to find the correct slug first.

### Issue: "Network Error"
**Solution:** Check that `VITE_API_BASE_URL` is set correctly and the backend is accessible.

### Issue: "TypeError: Cannot read property 'names'"
**Solution:** Ensure you're using helper functions like `getPrimaryName()` instead of direct property access.

### Issue: Empty relationships
**Solution:** Verify you're querying both `source_id` and `target_id` to get all relationships for an entity.

---

## References

- **Backend Types:** https://github.com/NewNepal-org/NepalEntityService-Tundikhel/blob/main/src/common/nes-types.ts
- **Live Reference:** https://tundikhel.nes.newnepal.org
- **Core NES:** https://github.com/NewNepal-org/NepalEntityService
- **API Documentation:** `/src/services/README.md`
