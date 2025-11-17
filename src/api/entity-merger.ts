/**
 * Entity Merger
 * 
 * Transforms NES Tundikhel entities into the merged PAP format
 */

import type { Entity, Person, Organization, Relationship } from '@/types/nes';
import type { Allegation as JDSAllegation } from '@/types/jds';
import type { 
  MergedEntity, 
  MergedRelationship, 
  MergedAllegation, 
  MergedCase 
} from '@/types/merged-entity';

/**
 * Transform NES Entity to Merged Entity format
 */
export function mergeNESEntity(
  nesEntity: Entity,
  allegations: JDSAllegation[] = [],
  relationships: Relationship[] = []
): MergedEntity {
  const isPerson = nesEntity.type === 'person';
  const personData = isPerson ? (nesEntity as Person).personal_details : null;

  // Extract names
  const names = {
    PRIMARY: nesEntity.names?.find(n => n.kind === 'PRIMARY')?.en?.full || 
             nesEntity.names?.[0]?.en?.full || 
             'Unknown',
    NEPALI: nesEntity.names?.find(n => n.kind === 'PRIMARY')?.ne?.full ||
            nesEntity.names?.[0]?.ne?.full,
    ALIAS: nesEntity.names
      ?.filter(n => n.kind === 'ALIAS' || n.kind === 'ALTERNATIVE')
      .map(n => n.en?.full || n.ne?.full)
      .filter(Boolean) as string[] || [],
  };

  // Extract identifiers
  const identifiers: MergedEntity['identifiers'] = {};
  if (nesEntity.identifiers) {
    nesEntity.identifiers.forEach(id => {
      switch (id.scheme) {
        case 'NP_CITIZENSHIP':
          identifiers.citizenship_no = id.value;
          break;
        case 'NP_PAN':
          identifiers.pan_no = id.value;
          break;
        case 'NP_VOTER_ID':
          identifiers.voter_id = id.value;
          break;
        case 'PASSPORT':
          identifiers.passport_no = id.value;
          break;
        case 'NP_NATIONAL_ID':
          identifiers.national_id = id.value;
          break;
        default:
          if (!identifiers.other_ids) identifiers.other_ids = {};
          identifiers.other_ids[id.scheme] = id.value;
      }
    });
  }

  // Extract contacts
  const contacts: MergedEntity['contacts'] = {};
  if (nesEntity.contacts) {
    nesEntity.contacts.forEach(contact => {
      switch (contact.type) {
        case 'EMAIL':
          contacts.email = contact.value;
          break;
        case 'PHONE':
        case 'MOBILE':
          contacts.phone = contact.value;
          break;
        case 'WEBSITE':
          contacts.website = contact.value;
          break;
      }
    });
  }

  // Extract address from person or organization
  if (isPerson && personData?.address) {
    const addr = personData.address;
    contacts.address = [
      addr.ward ? `Ward ${addr.ward}` : null,
      addr.municipality?.en?.value || addr.municipality?.ne?.value,
      addr.district?.en?.value || addr.district?.ne?.value,
      addr.province?.en?.value || addr.province?.ne?.value,
    ].filter(Boolean).join(', ');
    
    contacts.province = addr.province?.en?.value || addr.province?.ne?.value;
    contacts.district = addr.district?.en?.value || addr.district?.ne?.value;
    contacts.municipality = addr.municipality?.en?.value || addr.municipality?.ne?.value;
    contacts.ward = addr.ward?.toString();
  } else if ((nesEntity as Organization).address) {
    const addr = (nesEntity as Organization).address!;
    contacts.address = [
      addr.ward ? `Ward ${addr.ward}` : null,
      addr.municipality?.en?.value || addr.municipality?.ne?.value,
      addr.district?.en?.value || addr.district?.ne?.value,
      addr.province?.en?.value || addr.province?.ne?.value,
    ].filter(Boolean).join(', ');
  }

  // Extract descriptions
  const descriptions = {
    overview: nesEntity.short_description?.en?.value || nesEntity.short_description?.ne?.value,
    bio: nesEntity.description?.en?.value || nesEntity.description?.ne?.value,
    career: personData?.positions?.map(p => 
      `${p.title?.en?.value || p.title?.ne?.value || 'Position'} at ${p.organization?.en?.value || p.organization?.ne?.value || 'Organization'}`
    ).join('; '),
    details: nesEntity.description?.en?.value || nesEntity.description?.ne?.value,
  };

  // Extract attributes
  const attributes: MergedEntity['attributes'] = {};
  
  if (isPerson && personData) {
    attributes.gender = personData.gender || undefined;
    attributes.dob_ad = personData.date_of_birth_ad || undefined;
    attributes.dob_bs = personData.date_of_birth_bs || undefined;
    
    // Calculate age from DOB
    if (personData.date_of_birth_ad) {
      const birthDate = new Date(personData.date_of_birth_ad);
      const today = new Date();
      attributes.age = today.getFullYear() - birthDate.getFullYear();
    }

    attributes.education = personData.education?.map(e =>
      `${e.degree?.en?.value || e.degree?.ne?.value || 'Degree'} from ${e.institution?.en?.value || e.institution?.ne?.value || 'Institution'}`
    ).join('; ');

    attributes.political_position = personData.positions?.find(p => 
      p.title?.en?.value?.toLowerCase().includes('minister') ||
      p.title?.en?.value?.toLowerCase().includes('mp') ||
      p.title?.en?.value?.toLowerCase().includes('member')
    )?.title?.en?.value || personData.positions?.[0]?.title?.en?.value;
  }

  // Extract photo
  const primaryPhoto = nesEntity.pictures?.find(p => p.type === 'PRIMARY');
  if (primaryPhoto) {
    attributes.photo_url = primaryPhoto.url || primaryPhoto.file_name;
  }

  // Additional attributes from entity.attributes
  if (nesEntity.attributes) {
    attributes.extra_attributes = nesEntity.attributes;
  }

  // Transform relationships
  const mergedRelationships: MergedRelationship[] = relationships.map(rel => ({
    id: rel.id || `${rel.source_id}-${rel.target_id}`,
    source_id: rel.source_id,
    target_id: rel.target_id,
    type: rel.type,
    start_date: rel.start_date || undefined,
    end_date: rel.end_date || undefined,
    attributes: rel.attributes || undefined,
  }));

  // Transform allegations (from JDS)
  const mergedAllegations: MergedAllegation[] = allegations.map(a => ({
    id: a.id,
    entity_id: nesEntity.slug,
    title: a.title,
    summary: a.summary_en || a.summary_ne || '',
    severity: determineSeverity(a),
    status: a.status,
    date: a.created_at,
    evidence: a.documentary_evidence?.map(e => e.title || e.description) || [],
  }));

  // Transform cases (current allegations from JDS)
  const mergedCases: MergedCase[] = allegations
    .filter(a => a.state === 'current')
    .map(a => ({
      id: a.id,
      entity_id: nesEntity.slug,
      name: a.title,
      description: a.summary_en || a.summary_ne || '',
      documents: a.documentary_evidence?.map(e => e.title || e.url || 'Document') || [],
      timeline: a.timeline?.map(t => ({
        date: t.date,
        event: t.event_en || t.event_ne || 'Event',
        description: t.description_en || t.description_ne,
      })) || [],
      status: a.status,
    }));

  // Merge evidence and sources
  const evidence = {
    documentary: nesEntity.attributions?.map(a => 
      a.title?.en?.value || a.title?.ne?.value || 'Source'
    ) || [],
    sources: nesEntity.attributions?.map(a =>
      a.details?.en?.value || a.details?.ne?.value || ''
    ).filter(Boolean) || [],
    merged_references: nesEntity.attributions?.map((a, i) => {
      const title = a.title?.en?.value || a.title?.ne?.value || `Reference ${i + 1}`;
      const details = a.details?.en?.value || a.details?.ne?.value;
      return details ? `${title}: ${details}` : title;
    }) || [],
  };

  // Version summary
  const version_summary = nesEntity.version_summary ? {
    version: nesEntity.version_summary.version_number,
    created_at: nesEntity.version_summary.created_at,
    updated_at: nesEntity.version_summary.created_at, // NES doesn't separate updated_at
    author_id: nesEntity.version_summary.author?.id || 'unknown',
  } : undefined;

  return {
    id: nesEntity.slug,
    slug: nesEntity.slug,
    type: nesEntity.type || 'unknown',
    subtype: nesEntity.sub_type || undefined,
    names,
    identifiers: Object.keys(identifiers).length > 0 ? identifiers : undefined,
    contacts: Object.keys(contacts).length > 0 ? contacts : undefined,
    descriptions,
    attributes,
    relationships: mergedRelationships,
    allegations: mergedAllegations,
    cases: mergedCases,
    evidence,
    version_summary,
  };
}

/**
 * Determine severity from allegation data
 */
function determineSeverity(allegation: JDSAllegation): string {
  // Try to infer from allegation type or other fields
  const type = allegation.allegation_type?.toLowerCase() || '';
  
  if (type.includes('corruption') || type.includes('fraud') || type.includes('embezzlement')) {
    return 'High';
  }
  if (type.includes('misconduct') || type.includes('abuse')) {
    return 'Medium';
  }
  
  return 'Medium'; // Default
}
