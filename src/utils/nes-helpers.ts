import type { Entity, Name, Contact, LangText, ContactType } from '@/types/nes';

/**
 * Helper functions to work with NES entity data structures
 */

// Get primary name in specified language
export const getPrimaryName = (names: Name[], lang: 'en' | 'ne' = 'en'): string => {
  const primaryName = names.find(n => n.kind === 'PRIMARY');
  if (!primaryName) return '';
  
  if (lang === 'ne' && primaryName.ne?.full) {
    return primaryName.ne.full;
  }
  
  return primaryName.en?.full || '';
};

// Get any name by kind
export const getNameByKind = (names: Name[], kind: string, lang: 'en' | 'ne' = 'en'): string => {
  const name = names.find(n => n.kind === kind);
  if (!name) return '';
  
  if (lang === 'ne' && name.ne?.full) {
    return name.ne.full;
  }
  
  return name.en?.full || '';
};

// Get contact by type
export const getContactByType = (contacts: Contact[] | null | undefined, type: ContactType): string | null => {
  if (!contacts) return null;
  const contact = contacts.find(c => c.type === type);
  return contact?.value || null;
};

// Get email contact
export const getEmail = (contacts: Contact[] | null | undefined): string | null => {
  return getContactByType(contacts, 'EMAIL');
};

// Get phone contact
export const getPhone = (contacts: Contact[] | null | undefined): string | null => {
  return getContactByType(contacts, 'PHONE');
};

// Get website URL
export const getWebsite = (contacts: Contact[] | null | undefined): string | null => {
  return getContactByType(contacts, 'URL');
};

// Get description in specified language
export const getDescription = (description: LangText | null | undefined, lang: 'en' | 'ne' = 'en'): string => {
  if (!description) return '';
  
  return lang === 'ne' && description.ne?.value
    ? description.ne.value
    : description.en?.value || '';
};

// Get attribute value from entity
export const getAttribute = (entity: Entity, key: string): any => {
  return entity.attributes?.[key];
};

// Format entity type for display
export const formatEntityType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Format entity subtype for display
export const formatSubType = (subType: string | null | undefined): string => {
  if (!subType) return '';
  return subType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
