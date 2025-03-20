import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiResponse<T> {
  result: {
    success: boolean;
    data: T;
    error?: string;
  };
  success: boolean;
  data: T;
  error?: string;
}

export interface Template {
  id: string;
  content: string;
}

export interface SignatureData {
  fullName: string;
  jobTitle: string;
  profilePhoto: string;
  companyName: string;
  companyAddress: string;
  companyLogo: string;
  phone: string;
  email: string;
  website: string;
  websiteUrl: string;
  accentColor: string;
  tagline: string;
  disclaimer: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    [key: string]: string;
  };
}

export enum TemplateType {
  HTML = "HTML",
  Text = "TEXT",
}

export interface GeneratedSignature {
  signature: string;
  userId: string;
  templateId: string;
  timestamp: string;
}

export const templatesApi = {
  /**
   * Fetch all available templates
   * @returns Promise with template data
   */
  async fetchTemplates(): Promise<Template[]> {
    try {
      const response =
        await apiClient.get<ApiResponse<Template[]>>("/templates");
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || "Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific template by ID
   * @param id Template ID
   * @returns Promise with template data
   */
  async fetchTemplate(id: string): Promise<Template> {
    try {
      const response = await apiClient.get<ApiResponse<Template>>(
        `/templates/${id}`,
      );
      console.log(response);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || "Failed to fetch template");
      }
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  },
};

export const signaturesApi = {
  /**
   * Generate a signature with the provided data
   * @param templateId Template ID to use
   * @param userData User data for the signature
   * @returns Promise with generated signature
   */
  async generateSignature(
    templateId: string,
    userData: SignatureData,
    signatureType: TemplateType,
  ): Promise<GeneratedSignature> {
    try {
      console.log("Generating signature...");
      const response = await apiClient.post<ApiResponse<GeneratedSignature>>(
        "/signatures/generate",
        {
          templateId,
          userData,
          signatureType,
        },
      );

      if (response.data.result.success) {
        return response.data.result.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error generating signature:", error);
      throw error;
    }
  },
};

export default {
  templates: templatesApi,
  signatures: signaturesApi,
};
