/**
 * Entity Detail Sections
 * 
 * Display all 11 required sections for merged entity data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Briefcase,
  History
} from 'lucide-react';
import type { MergedEntity } from '@/types/merged-entity';

interface EntityDetailSectionsProps {
  entity: MergedEntity;
}

export function EntityDetailSections({ entity }: EntityDetailSectionsProps) {
  return (
    <div className="space-y-6">
      {/* 2. Personal Details / Attributes */}
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
              {entity.attributes.gender && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                  <dd className="text-sm">{entity.attributes.gender}</dd>
                </div>
              )}
              {entity.attributes.dob_ad && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date of Birth (AD)</dt>
                  <dd className="text-sm">{new Date(entity.attributes.dob_ad).toLocaleDateString()}</dd>
                </div>
              )}
              {entity.attributes.dob_bs && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date of Birth (BS)</dt>
                  <dd className="text-sm">{entity.attributes.dob_bs}</dd>
                </div>
              )}
              {entity.attributes.age && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                  <dd className="text-sm">{entity.attributes.age} years</dd>
                </div>
              )}
              {entity.attributes.birth_place && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Birth Place</dt>
                  <dd className="text-sm">{entity.attributes.birth_place}</dd>
                </div>
              )}
              {entity.attributes.citizenship_place && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Citizenship Place</dt>
                  <dd className="text-sm">{entity.attributes.citizenship_place}</dd>
                </div>
              )}
              {entity.attributes.father_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Father's Name</dt>
                  <dd className="text-sm">{entity.attributes.father_name}</dd>
                </div>
              )}
              {entity.attributes.mother_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Mother's Name</dt>
                  <dd className="text-sm">{entity.attributes.mother_name}</dd>
                </div>
              )}
              {entity.attributes.spouse_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Spouse's Name</dt>
                  <dd className="text-sm">{entity.attributes.spouse_name}</dd>
                </div>
              )}
              {entity.attributes.education && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Education</dt>
                  <dd className="text-sm">{entity.attributes.education}</dd>
                </div>
              )}
              {entity.attributes.occupation && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Occupation</dt>
                  <dd className="text-sm">{entity.attributes.occupation}</dd>
                </div>
              )}
              {entity.attributes.political_position && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Political Position</dt>
                  <dd className="text-sm">{entity.attributes.political_position}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* 3. Identifiers */}
      {entity.identifiers && Object.keys(entity.identifiers).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Identifiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entity.identifiers.citizenship_no && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Citizenship No.</dt>
                  <dd className="text-sm font-mono">{entity.identifiers.citizenship_no}</dd>
                </div>
              )}
              {entity.identifiers.pan_no && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">PAN No.</dt>
                  <dd className="text-sm font-mono">{entity.identifiers.pan_no}</dd>
                </div>
              )}
              {entity.identifiers.voter_id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Voter ID</dt>
                  <dd className="text-sm font-mono">{entity.identifiers.voter_id}</dd>
                </div>
              )}
              {entity.identifiers.passport_no && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Passport No.</dt>
                  <dd className="text-sm font-mono">{entity.identifiers.passport_no}</dd>
                </div>
              )}
              {entity.identifiers.national_id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">National ID</dt>
                  <dd className="text-sm font-mono">{entity.identifiers.national_id}</dd>
                </div>
              )}
              {entity.identifiers.other_ids && Object.entries(entity.identifiers.other_ids).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                  <dd className="text-sm font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* 4. Contacts */}
      {entity.contacts && Object.keys(entity.contacts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {entity.contacts.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm">
                      <a href={`mailto:${entity.contacts.email}`} className="text-primary hover:underline">
                        {entity.contacts.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {entity.contacts.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="text-sm">
                      <a href={`tel:${entity.contacts.phone}`} className="text-primary hover:underline">
                        {entity.contacts.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {entity.contacts.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                    <dd className="text-sm">
                      <a href={entity.contacts.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {entity.contacts.website}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {entity.contacts.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                    <dd className="text-sm">{entity.contacts.address}</dd>
                  </div>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* 5. Descriptions */}
      {entity.descriptions && (entity.descriptions.overview || entity.descriptions.bio || entity.descriptions.career) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entity.descriptions.overview && (
              <div>
                <h4 className="text-sm font-medium mb-2">Overview</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {entity.descriptions.overview}
                </p>
              </div>
            )}
            {entity.descriptions.bio && entity.descriptions.bio !== entity.descriptions.overview && (
              <div>
                <h4 className="text-sm font-medium mb-2">Biography</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {entity.descriptions.bio}
                </p>
              </div>
            )}
            {entity.descriptions.career && (
              <div>
                <h4 className="text-sm font-medium mb-2">Career</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {entity.descriptions.career}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Electoral History */}
      {entity.electoral_details?.candidacies && entity.electoral_details.candidacies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Electoral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entity.electoral_details.candidacies.map((candidacy, idx) => (
                <div key={idx} className="border-b border-border pb-4 last:border-0">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Election Year</dt>
                      <dd className="text-sm">{candidacy.election_year}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Election Type</dt>
                      <dd className="text-sm">{candidacy.election_type}</dd>
                    </div>
                    {candidacy.position && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Position</dt>
                        <dd className="text-sm">{candidacy.position}</dd>
                      </div>
                    )}
                    {candidacy.pa_subdivision && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">PA Subdivision</dt>
                        <dd className="text-sm">{candidacy.pa_subdivision}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Candidate ID</dt>
                      <dd className="text-sm font-mono">{candidacy.candidate_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Constituency ID</dt>
                      <dd className="text-sm">{candidacy.constituency_id}</dd>
                    </div>
                    {candidacy.votes_received !== undefined && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Votes Received</dt>
                        <dd className="text-sm">{candidacy.votes_received.toLocaleString()}</dd>
                      </div>
                    )}
                    {candidacy.elected !== undefined && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Result</dt>
                        <dd className="text-sm">
                          <Badge variant={candidacy.elected ? "default" : "secondary"}>
                            {candidacy.elected ? "Elected" : "Not Elected"}
                          </Badge>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 10. References (Evidence + Sources merged) */}
      {entity.evidence && entity.evidence.merged_references && entity.evidence.merged_references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              References & Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {entity.evidence.merged_references.map((ref, index) => (
                <li key={index} className="border-l-2 border-primary pl-4 text-sm">
                  {ref}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
