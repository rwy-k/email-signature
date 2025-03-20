export interface UserData {
  userId: string;
  fullName: string;
  jobTitle: string;
  profilePhoto?: string;
  companyName: string;
  companyAddress?: string;
  companyLogo?: string;
  phone?: string;
  email: string;
  website?: string;
  websiteUrl?: string;
  accentColor?: string;
  tagline?: string;
  disclaimer?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface SignatureRequest {
  templateId: string;
  userData: UserData;
  webhookUrl?: string;
}

export interface SignatureResponse {
  success: boolean;
  userId: string;
  templateId: string;
  timestamp: string;
  data?: string;
}
