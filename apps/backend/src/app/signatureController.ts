import { Request, Response } from "express";
import { SignatureService } from "./signatureService.js";
import { TemplateProcessor } from "./templateProcessor.js";

export class SignatureController {
  private signatureService: SignatureService;

  constructor() {
    this.signatureService = new SignatureService();
  }

  public async generateSignature(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, userData, signatureType, webhookUrl } = req.body;

      console.log("Generating signature:", templateId, signatureType);

      // Validate input
      if (!templateId || !userData) {
        res
          .status(400)
          .json({ error: "Template ID and user data are required." });
        return;
      }

      // Generate the signature
      const result = await this.signatureService.generateSignature(
        templateId,
        userData,
        signatureType,
        webhookUrl,
      );
      console.log("Signature generated:", result);
      // Send response
      res
        .status(202)
        .json({ message: "Signature generation in progress.", result });
    } catch (error) {
      console.error("Error generating signature:", error);
      res
        .status(500)
        .json({ error: "An error occurred while generating the signature." });
    }
  }

  public async getTemplates(req: Request, res: Response): Promise<void> {
    console.log("Getting templates...");
    try {
      const templates = TemplateProcessor.getAllTemplates();
      console.log("Templates:", templates.length);

      // Always return a valid response, even if empty
      res.status(200).json({
        success: true,
        data: templates || [],
      });
    } catch (error) {
      console.error("Error retrieving templates:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve templates",
        message: error instanceof Error ? error.message : error,
      });
    }
  }

  public async getTemplateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const template = TemplateProcessor.getTemplateContent(id);

    if (!template) {
      res.status(404).json({ error: "Template not found." });
      return;
    }

    res.status(200).json({ success: true, data: template });
  }
}
