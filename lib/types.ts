export type Role = "etudiant" | "operateur";
export type ProfileLevel = "l2" | "l3" | "master" | "jeune_diplome";
export type Seek = "stage" | "job";
export type Paid = "oui" | "non" | "inconnu";
export type ApplyMode = "lien" | "email" | "interet";
export type OfferStatus = "brouillon" | "publiee" | "pourvue" | "expiree";
export type InterestStatus = "interesse" | "candidate";
export type ReportKind = "pas_pour_moi" | "signalement";

export type Profile = {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  phone: string;
  whatsapp: string;
  city: string;
  school: string;
  level: ProfileLevel | "";
  domains: string[];
  skills: string[];
  lookingFor: Seek[];
  availability: string;
  cvPath: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  city: string;
  sector: string;
  website: string;
};

export type Opportunity = {
  id: string;
  organizationId: string;
  organizationName: string;
  type: "stage" | "job" | "hackathon";
  title: string;
  description: string;
  city: string;
  remote: boolean;
  domains: string[];
  levels: string[];
  paid: Paid;
  compensationNote: string;
  duration: string;
  startDate: string | null;
  deadline: string | null;
  applyMode: ApplyMode;
  applyTarget: string;
  status: OfferStatus;
  source: string;
  verifiedAt: string | null;
  createdAt: string;
};

export type Interest = {
  id: string;
  profileId: string;
  opportunityId: string;
  status: InterestStatus;
  createdAt: string;
  updatedAt: string;
};

export type Report = {
  id: string;
  profileId: string;
  opportunityId: string;
  kind: ReportKind;
  reason: string;
  note: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type CatalogueFilters = {
  ville?: string;
  type?: string;
  filiere?: string;
  remunere?: string;
};

export type ActionState = {
  error?: string;
  message?: string;
};
