/**
 * Entity Detail Sections
 * 
 * Display entity detail sections using raw NES Entity data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  FileText,
} from 'lucide-react';
import type { Entity } from '@/types/nes';
import { getEmail, getPhone, getWebsite } from '@/utils/nes-helpers';

interface EntityDetailSectionsProps {
  entity: Entity;
}

export function EntityDetailSections({ entity }: EntityDetailSectionsProps) {
  const email = getEmail(entity.contacts);
  const phone = getPhone(entity.contacts);
  const website = getWebsite(entity.contacts);

  return (
    <div className="space-y-6">
      {/* Attributes */}
      {entity.attributes && Object.keys(entity.attributes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(entity.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="text-sm">{String(value)}</dd>
                </div>
              ))}
            </dl>
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
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entity.id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Tundikhel</dt>
                  <dd className="text-sm">
                    <a 
                      href={`https://tundikhel.nes.newnepal.org/#/entity/${entity.id.replace(/^entity:/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono"
                    >
                      {entity.id}
                    </a>
                  </dd>
                </div>
              )}
              {entity.identifiers?.map((identifier, index) => (
                <div key={index}>
                  <dt className="text-sm font-medium text-muted-foreground">{identifier.scheme}</dt>
                  <dd className="text-sm font-mono">{identifier.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Contacts */}
      {entity.contacts && entity.contacts.length > 0 && (
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
