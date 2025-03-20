import { Router } from "express";
import { SignatureController } from "./signatureController.js";

const signatureController = new SignatureController();

export const setRoutes = (app: Router) => {
  app.post(
    "/signatures/generate",
    signatureController.generateSignature.bind(signatureController),
  );
  app.get(
    "/templates",
    signatureController.getTemplates.bind(signatureController),
  );
  app.get(
    "/templates/:id",
    signatureController.getTemplateById.bind(signatureController),
  );
};
