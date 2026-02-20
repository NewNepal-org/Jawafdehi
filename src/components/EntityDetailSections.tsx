/**
 * Entity Detail Sections
 * 
 * Display entity detail sections using raw NES Entity data
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  CreditCard, 
  FileText,
  Tag,
  Vote,
  ExternalLink,
} from 'lucide-react';
import type { Entity } from '@/types/nes';

interface EntityDetailSectionsProps {
  entity: Entity;
}

// Helper function to format attribute values
function formatAttributeValue(value: unknown): string | Record<string, any> | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, any>;
    
    // Check if it's a LangText structure (has en/ne with value)
    if (obj.en?.value || obj.ne?.value) {
      const enValue = obj.en?.value;
      const neValue = obj.ne?.value;
      
      // Show both if they exist and are different
      if (enValue && neValue && enValue !== neValue) {
        return `${enValue} (${neValue})`;
      }
      // Otherwise show whichever exists
      return enValue || neValue || null;
    }
    
    // Check if it has a direct value property
    if (obj.value !== undefined && typeof obj.value === 'string') {
      return obj.value;
    }
    
    // For arrays, join them
    if (Array.isArray(value)) {
      const formatted = value.map(v => formatAttributeValue(v)).filter(v => v !== null);
      return formatted.length > 0 ? formatted.join(', ') : null;
    }
    
    // For nested objects (like election_council_misc), return as structured data
    // This will be handled specially in the rendering
    return obj;
  }
  
  return null;
}

// Helper to render nested object fields
function renderNestedFields(obj: Record<string, any>): React.ReactNode {
  const fields: React.ReactNode[] = [];
  
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null && val !== undefined) {
      const formatted = formatAttributeValue(val);
      if (formatted && typeof formatted !== 'object') {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        fields.push(
          <div key={key} className="text-sm">
            <span className="font-medium text-muted-foreground">{formattedKey}:</span> {formatted}
          </div>
        );
      }
    }
  }
  
  return fields.length > 0 ? <div className="space-y-1">{fields}</div> : null;
}

export function EntityDetailSections({ entity }: EntityDetailSectionsProps) {
  // Check if entity is a Person type (has electoral_details)
  const isPerson = entity.type === 'person';
  const personEntity = isPerson ? (entity as any) : null;

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      {entity.tags && entity.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entity.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Details (Names + Attributes) */}
      {((entity.names && entity.names.length > 0) || (entity.attributes && Object.keys(entity.attributes).length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Names Section */}
            {entity.names && entity.names.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Name</h4>
                <dl className="space-y-4">
                  {entity.names.map((name, index) => (
                    <div key={index} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        {name.kind === 'PRIMARY' ? 'Primary Name' : 
                         name.kind === 'ALIAS' ? 'Alias' :
                         name.kind === 'ALTERNATE' ? 'Alternate Name' :
                         name.kind === 'BIRTH_NAME' ? 'Birth Name' : name.kind}
                      </dt>
                      <dd className="space-y-1">
                        {name.en?.full && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">English:</span> {name.en.full}
                          </div>
                        )}
                        {name.ne?.full && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Nepali:</span> {name.ne.full}
                          </div>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Attributes Section */}
            {entity.attributes && Object.keys(entity.attributes).length > 0 && (
              <>
                {entity.names && entity.names.length > 0 && (
                  <div className="border-t border-border pt-4" />
                )}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Additional Details</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(entity.attributes)
                      .map(([key, value]) => {
                        const formatted = formatAttributeValue(value);
                        return { key, value, formatted };
                      })
                      .filter(({ formatted }) => formatted !== null)
                      .map(({ key, formatted }) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground capitalize mb-1">
                            {key.replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-sm">
                            {typeof formatted === 'object' && !Array.isArray(formatted) && formatted !== null
                              ? renderNestedFields(formatted as Record<string, any>)
                              : String(formatted)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Identifiers */}
      {((entity.identifiers && entity.identifiers.length > 0) || entity.id) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tundikhel ID as a prominent button */}
            {entity.id && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">Tundikhel Entity System</dt>
                <dd>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-mono"
                  >
                    <a 
                      href={`https://tundikhel.nes.newnepal.org/#/entity/${entity.id.replace(/^entity:/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View in Tundikhel
                    </a>
                  </Button>
                </dd>
              </div>
            )}
            
            {/* Other identifiers (filter out "other" scheme) */}
            {entity.identifiers && entity.identifiers.filter(id => id.scheme !== 'other').length > 0 && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">External Identifiers</dt>
                <dd className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entity.identifiers
                    .filter(identifier => identifier.scheme !== 'other')
                    .map((identifier, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="capitalize">
                          {identifier.scheme}
                        </Badge>
                        <span className="text-sm font-mono break-all">{identifier.value}</span>
                      </div>
                    ))}
                </dd>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* {entity.contacts && entity.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm">
                      <a href={`mailto:${email}`} className="text-primary hover:underline">
                        {email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="text-sm">
                      <a href={`tel:${phone}`} className="text-primary hover:underline">
                        {phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                    <dd className="text-sm">
                      <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {website}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )} */}

      {/* Electoral History */}
      {isPerson && personEntity?.electoral_details?.candidacies && personEntity.electoral_details.candidacies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Electoral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personEntity.electoral_details.candidacies.map((candidacy: any, index: number) => (
                <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">
                        {candidacy.election_year} {candidacy.election_type.replace('_', ' ').toUpperCase()} Election
                      </h4>
                      {candidacy.position && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {candidacy.position.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    {candidacy.elected !== undefined && (
                      <Badge variant={candidacy.elected ? "default" : "secondary"}>
                        {candidacy.elected ? "Elected" : "Not Elected"}
                      </Badge>
                    )}
                  </div>
                  
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {candidacy.votes_received !== undefined && candidacy.votes_received !== null && (
                      <div>
                        <dt className="text-muted-foreground">Votes:</dt>
                        <dd className="font-medium">{candidacy.votes_received.toLocaleString()}</dd>
                      </div>
                    )}
                    {candidacy.symbol?.symbol_name && (
                      <div>
                        <dt className="text-muted-foreground">Symbol:</dt>
                        <dd>{candidacy.symbol.symbol_name.en?.value || candidacy.symbol.symbol_name.ne?.value}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {entity.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entity.description.en?.value || entity.description.ne?.value || ''}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Entity Detail Source */}
      {entity.attributions && entity.attributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Entity Detail Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {entity.attributions.map((attribution, index) => {
                const title = attribution.title?.en?.value || attribution.title?.ne?.value || 'Source';
                return (
                  <li key={index} className="border-l-2 border-primary pl-4 text-sm">
                    {title}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
