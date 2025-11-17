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
      ?.filter(n => n.kind === 'ALIAS' || n.kind === 'ALTERNATE')
      .map(n => n.en?.full || n.ne?.full)
      .filter(Boolean) as string[] || [],
  };

  // Extract identifiers from attributes (NES stores Nepal-specific IDs in attributes)
  const identifiers: MergedEntity['identifiers'] = {};
  if (nesEntity.attributes) {
    const attrs = nesEntity.attributes as any;
    if (attrs.citizenship_no) identifiers.citizenship_no = attrs.citizenship_no;
    if (attrs.pan_no) identifiers.pan_no = attrs.pan_no;
    if (attrs.voter_id) identifiers.voter_id = attrs.voter_id;
    if (attrs.passport_no) identifiers.passport_no = attrs.passport_no;
    if (attrs.national_id) identifiers.national_id = attrs.national_id;
  }
  
  // Extract external identifiers
  if (nesEntity.identifiers) {
    nesEntity.identifiers.forEach(id => {
      if (!identifiers.other_ids) identifiers.other_ids = {};
      identifiers.other_ids[id.scheme] = id.value;
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
          contacts.phone = contact.value;
          break;
        case 'URL':
          contacts.website = contact.value;
          break;
      }
    });
  }

  // Extract address from person or organization
  if (isPerson && personData?.address) {
    const addr = personData.address;
    // Address has location_id and description2
    contacts.address = addr.description2?.en?.value || addr.description2?.ne?.value;
  } else if ((nesEntity as any).address) {
    const addr = (nesEntity as any).address;
    contacts.address = addr.description2?.en?.value || addr.description2?.ne?.value;
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
    attributes.dob_ad = personData.birth_date || undefined;
    attributes.dob_bs = undefined; // No BS date in NES schema
    
    // Calculate age from birth_date
    if (personData.birth_date) {
      const birthDate = new Date(personData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      attributes.age = age;
    }

    // Extract family information
    attributes.father_name = personData.father_name?.en?.value || personData.father_name?.ne?.value;
    attributes.mother_name = personData.mother_name?.en?.value || personData.mother_name?.ne?.value;
    attributes.spouse_name = personData.spouse_name?.en?.value || personData.spouse_name?.ne?.value;

    // Extract birth and citizenship places
    if (personData.birth_place) {
      attributes.birth_place = personData.birth_place.description2?.en?.value || 
                               personData.birth_place.description2?.ne?.value;
    }
    if (personData.citizenship_place) {
      attributes.citizenship_place = personData.citizenship_place.description2?.en?.value || 
                                     personData.citizenship_place.description2?.ne?.value;
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

  // Extract photos (NES uses thumb, full, wide types)
  const thumbPhoto = nesEntity.pictures?.find(p => p.type === 'thumb');
  if (thumbPhoto) {
    attributes.photo_url = thumbPhoto.url;
  }
  
  const coverPhoto = nesEntity.pictures?.find(p => p.type === 'wide');
  if (coverPhoto) {
    attributes.cover_photo_url = coverPhoto.url;
  }

  // Additional attributes from entity.attributes
  if (nesEntity.attributes) {
    attributes.extra_attributes = nesEntity.attributes;
  }

  // Transform relationships
  const mergedRelationships: MergedRelationship[] = relationships.map(rel => ({
    id: rel.id || `${rel.source_entity_id}-${rel.target_entity_id}`,
    source_id: rel.source_entity_id,
    target_id: rel.target_entity_id,
    type: rel.type,
    start_date: rel.start_date || undefined,
    end_date: rel.end_date || undefined,
    attributes: rel.attributes || undefined,
  }));

  // Transform allegations (from JDS)
  const mergedAllegations: MergedAllegation[] = allegations.map(a => ({
    id: a.id.toString(),
    entity_id: nesEntity.slug,
    title: a.title,
    summary: a.description || a.key_allegations || '',
    severity: determineSeverity(a),
    status: a.status || 'under_investigation',
    date: a.first_public_date || a.created_at,
    evidence: a.evidences?.map(e => e.file_url).filter(Boolean) as string[] || [],
  }));

  // Transform cases (current allegations from JDS)
  const mergedCases: MergedCase[] = allegations
    .filter(a => a.state === 'current')
    .map(a => ({
      id: a.id.toString(),
      entity_id: nesEntity.slug,
      name: a.title,
      description: a.description || '',
      documents: a.evidences?.map(e => e.file_url).filter(Boolean) as string[] || [],
      timeline: a.timelines?.map(t => ({
        date: t.date,
        event: t.title || 'Event',
        description: t.description,
      })) || [],
      status: a.status || 'under_investigation',
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

  // Extract electoral details for persons
  let electoral_details: MergedEntity['electoral_details'] = undefined;
  if (isPerson) {
    const personEntity = nesEntity as Person;
    if (personEntity.electoral_details?.candidacies && personEntity.electoral_details.candidacies.length > 0) {
      electoral_details = {
        candidacies: personEntity.electoral_details.candidacies.map(c => ({
          election_year: c.election_year,
          election_type: c.election_type,
          constituency_id: c.constituency_id,
          candidate_id: c.candidate_id,
          position: c.position || undefined,
          party_id: c.party_id || undefined,
          votes_received: c.votes_received || undefined,
          elected: c.elected || undefined,
          pa_subdivision: c.pa_subdivision || undefined,
        })),
      };
    }
  }

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
    electoral_details,
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
