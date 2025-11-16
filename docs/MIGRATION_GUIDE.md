# NES Integration Migration Guide

This guide explains how to migrate from the old custom API types to the official NES type system.

## Overview

The PAP frontend has been fully integrated with the Nepal Entity Service (NES) backend. This integration provides:

✅ **Official NES Types** - Exact copies from backend type definitions  
✅ **Proper API Endpoints** - Correct parameter naming and response handling  
✅ **Helper Functions** - Easy access to nested data structures  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Evidence & Sources** - Merged documentary evidence display  

---

## Breaking Changes

### 1. Entity Type Structure

#### ❌ OLD (Custom Types)
```typescript
interface Entity {
  names: {
    PRIMARY: string;
    ENGLISH: string;
    NEPALI: string;
  };
  contacts: {
    email: string;
    phone: string;
    website: string;
  };
  descriptions: {
    ENGLISH: string;
    NEPALI: string;
  };
  subtype: string;
}
```

#### ✅ NEW (NES Types)
```typescript
interface Entity {
  names: Name[];  // Array of multilingual name objects
  contacts: Contact[];  // Array of contact objects
  description: LangText;  // Single multilingual description object
  sub_type: EntitySubType | null;
}

interface Name {
  kind: 'PRIMARY' | 'ALIAS' | 'ALTERNATE' | 'BIRTH_NAME';
  en?: NameParts | null;  // { full, given, middle, family, ... }
  ne?: NameParts | null;
}

interface Contact {
  type: ContactType;  // 'EMAIL' | 'PHONE' | 'URL' | ...
  value: string;
}
```

---

### 2. Relationship Fields

#### ❌ OLD
```typescript
interface Relationship {
  source_id: string;
  target_id: string;
}
```

#### ✅ NEW
```typescript
interface Relationship {
  source_entity_id: string;
  target_entity_id: string;
}
```

---

### 3. Version Summary

#### ❌ OLD
```typescript
version_summary: {
  version: number;
  created_at: string;
  updated_at: string;
  author_id: string;
}
```

#### ✅ NEW
```typescript
version_summary: {
  version_number: number;
  created_at: string;
  // No updated_at field
  author: Author;  // Full author object, not just ID
}
```

---

## Migration Steps

### Step 1: Update Imports

#### ❌ OLD
```typescript
import { Entity } from '@/services/api';
```

#### ✅ NEW
```typescript
import type { Entity } from '@/types/nes';
import { getEntityById } from '@/services/api';
import { getPrimaryName, getEmail } from '@/utils/nes-helpers';
```

---

### Step 2: Use Helper Functions

#### ❌ OLD
```typescript
const name = entity.names?.PRIMARY || entity.names?.ENGLISH || 'Unknown';
const email = entity.contacts?.email;
const description = entity.descriptions?.ENGLISH;
```

#### ✅ NEW
```typescript
import { getPrimaryName, getEmail, getDescription } from '@/utils/nes-helpers';

const name = getPrimaryName(entity.names, 'en');
const nameNe = getPrimaryName(entity.names, 'ne');
const email = getEmail(entity.contacts);
const description = getDescription(entity.description, 'en');
```

---

### Step 3: Update API Calls

#### ❌ OLD
```typescript
// Search with 'search' parameter
const results = await searchEntities('ram', {
  search: 'ram',  // Wrong parameter name
  type: 'person'
});

// Get relationships with old field names
const rels = await getRelationships({ source_id: id });
const isSource = rel.source_id === id;  // Wrong field
```

#### ✅ NEW
```typescript
// Search with 'q' parameter (correct backend param)
const results = await searchEntities('ram', {
  type: 'person',
  page: 1,
  limit: 10
});

// Get relationships with correct field names
const rels = await getRelationships({ source_id: id });
const isSource = rel.source_entity_id === id;  // Correct field
```

---

### Step 4: Update Component Code

#### ❌ OLD
```typescript
const EntityCard = ({ entity }: { entity: Entity }) => {
  const name = entity.names?.PRIMARY || 'Unknown';
  const position = entity.attributes?.position || 'N/A';
  
  return (
    <Card>
      <h3>{name}</h3>
      {entity.names?.NEPALI && <p>{entity.names.NEPALI}</p>}
      <p>{position}</p>
    </Card>
  );
};
```

#### ✅ NEW
```typescript
import { getPrimaryName, getAttribute } from '@/utils/nes-helpers';

const EntityCard = ({ entity }: { entity: Entity }) => {
  const name = getPrimaryName(entity.names, 'en');
  const nameNe = getPrimaryName(entity.names, 'ne');
  const position = getAttribute(entity, 'position') || 'N/A';
  
  return (
    <Card>
      <h3>{name}</h3>
      {nameNe && <p>{nameNe}</p>}
      <p>{String(position)}</p>
    </Card>
  );
};
```

---

### Step 5: Handle Attributions (Evidence & Sources)

#### ✅ NEW (No old equivalent)
```typescript
import { mergeEvidenceAndSources } from '@/services/nes-adapters';

const entity = await getEntityById(slug);
const sources = mergeEvidenceAndSources(entity);

sources.forEach(source => {
  console.log(`${source.title} (${source.type})`);
  console.log(`Description: ${source.description}`);
  console.log(`URL: ${source.url}`);
});
```

---

## Complete Example Migration

### ❌ OLD Code
```typescript
import { useState, useEffect } from 'react';
import { getEntityById, getRelationships } from '@/services/api';

function EntityProfile({ id }) {
  const [entity, setEntity] = useState(null);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const entityData = await getEntityById(id);
      setEntity(entityData);

      const rels = await getRelationships({ source_id: id });
      setRelationships(rels.relationships || rels || []);
    };
    fetchData();
  }, [id]);

  if (!entity) return <div>Loading...</div>;

  const name = entity.names?.PRIMARY || 'Unknown';
  const email = entity.contacts?.email;
  const description = entity.descriptions?.ENGLISH;

  return (
    <div>
      <h1>{name}</h1>
      {entity.names?.NEPALI && <p>{entity.names.NEPALI}</p>}
      {email && <a href={`mailto:${email}`}>{email}</a>}
      <p>{description}</p>
      
      <h2>Relationships</h2>
      {relationships.map(rel => (
        <div key={rel.id}>
          {rel.source_id} → {rel.target_id}
        </div>
      ))}
    </div>
  );
}
```

### ✅ NEW Code
```typescript
import { useState, useEffect } from 'react';
import { getEntityById, getRelationships } from '@/services/api';
import { getPrimaryName, getEmail, getDescription } from '@/utils/nes-helpers';
import { mergeEvidenceAndSources } from '@/services/nes-adapters';
import type { Entity, Relationship } from '@/types/nes';

function EntityProfile({ id }: { id: string }) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch entity
      const entityData = await getEntityById(id);
      setEntity(entityData);

      // Fetch relationships (both as source and target)
      const [sourceRels, targetRels] = await Promise.all([
        getRelationships({ source_id: id }),
        getRelationships({ target_id: id })
      ]);
      
      const allRels = [
        ...sourceRels.relationships,
        ...targetRels.relationships
      ];
      setRelationships(allRels);
    };
    fetchData();
  }, [id]);

  if (!entity) return <div>Loading...</div>;

  // Use helper functions to access data
  const name = getPrimaryName(entity.names, 'en');
  const nameNe = getPrimaryName(entity.names, 'ne');
  const email = getEmail(entity.contacts);
  const description = getDescription(entity.description, 'en');
  const sources = mergeEvidenceAndSources(entity);

  return (
    <div>
      <h1>{name}</h1>
      {nameNe && <p>{nameNe}</p>}
      {email && <a href={`mailto:${email}`}>{email}</a>}
      <p>{description}</p>
      
      <h2>Relationships</h2>
      {relationships.map((rel, idx) => (
        <div key={`${rel.source_entity_id}-${rel.target_entity_id}-${idx}`}>
          {rel.source_entity_id} → {rel.target_entity_id}
          <span>({rel.type})</span>
        </div>
      ))}
      
      <h2>Evidence & Sources</h2>
      {sources.map(source => (
        <div key={source.id}>
          <strong>{source.title}</strong> ({source.type})
          {source.description && <p>{source.description}</p>}
          {source.url && <a href={source.url}>View Source</a>}
        </div>
      ))}
    </div>
  );
}
```

---

## Helper Functions Reference

Import from `@/utils/nes-helpers`:

| Function | Purpose | Example |
|----------|---------|---------|
| `getPrimaryName(names, lang)` | Get primary name | `getPrimaryName(entity.names, 'en')` |
| `getNameByKind(names, kind, lang)` | Get name by kind | `getNameByKind(entity.names, 'ALIAS', 'en')` |
| `getEmail(contacts)` | Get email contact | `getEmail(entity.contacts)` |
| `getPhone(contacts)` | Get phone contact | `getPhone(entity.contacts)` |
| `getWebsite(contacts)` | Get website URL | `getWebsite(entity.contacts)` |
| `getDescription(description, lang)` | Get description | `getDescription(entity.description, 'en')` |
| `getAttribute(entity, key)` | Get custom attribute | `getAttribute(entity, 'position')` |
| `formatSubType(subType)` | Format subtype | `formatSubType('political_party')` → "Political Party" |

---

## Adapter Functions Reference

Import from `@/services/nes-adapters`:

| Function | Purpose | Example |
|----------|---------|---------|
| `mergeEvidenceAndSources(entity)` | Merge attributions into sources | `mergeEvidenceAndSources(entity)` |
| `formatSourceType(type)` | Format source type | `formatSourceType('document')` → "Document" |
| `groupSourcesByType(sources)` | Group sources by type | `groupSourcesByType(sources)` |
| `sortSourcesByDate(sources)` | Sort by date | `sortSourcesByDate(sources)` |

---

## Testing Your Migration

Run the included tests:

```bash
npm run test
```

Test files:
- `tests/api.test.ts` - API function tests
- `tests/nes-adapters.test.ts` - Adapter function tests
- `tests/integration.test.ts` - End-to-end flow tests

---

## Common Pitfalls

### ❌ Accessing names directly
```typescript
entity.names.PRIMARY  // ❌ Wrong - names is an array
```

### ✅ Use helper function
```typescript
getPrimaryName(entity.names, 'en')  // ✅ Correct
```

---

### ❌ Assuming fields exist
```typescript
entity.contacts.email  // ❌ Wrong - contacts is an array
```

### ✅ Use helper function with null check
```typescript
const email = getEmail(entity.contacts);  // ✅ Returns null if not found
if (email) {
  // Use email
}
```

---

### ❌ Using old relationship field names
```typescript
rel.source_id  // ❌ Wrong field name
```

### ✅ Use correct field names
```typescript
rel.source_entity_id  // ✅ Correct
```

---

## Need Help?

- Check API documentation: `/src/services/README.md`
- Review example code: `/docs/API_EXAMPLES.md`
- Examine type definitions: `/src/types/nes.ts`
- Reference: https://tundikhel.nes.newnepal.org

---

## References

- **Backend Types:** https://github.com/NewNepal-org/NepalEntityService-Tundikhel/blob/main/src/common/nes-types.ts
- **Live Reference:** https://tundikhel.nes.newnepal.org
- **Core NES:** https://github.com/NewNepal-org/NepalEntityService
