import { SignatureService } from './signatureService.js';
import { TemplateProcessor } from './templateProcessor.js';
export class SignatureController {
    constructor() {
        this.signatureService = new SignatureService();
    }
    async generateSignature(req, res) {
        try {
            const { templateId, userData, signatureType, webhookUrl } = req.body;
            console.log('Generating signature:', templateId, signatureType);
            // Validate input
            if (!templateId || !userData) {
                res.status(400).json({ error: 'Template ID and user data are required.' });
                return;
            }
            // Generate the signature
            const result = await this.signatureService.generateSignature(templateId, userData, signatureType, webhookUrl);
            console.log('Signature generated:', result);
            // Send response
            res.status(202).json({ message: 'Signature generation in progress.', result });
        }
        catch (error) {
            console.error('Error generating signature:', error);
            res.status(500).json({ error: 'An error occurred while generating the signature.' });
        }
    }
    async getTemplates(req, res) {
        console.log('Getting templates...');
        try {
            const templates = TemplateProcessor.getAllTemplates();
            console.log('Templates:', templates.length);
            // Always return a valid response, even if empty
            res.status(200).json({
                success: true,
                data: templates || []
            });
        }
        catch (error) {
            console.error('Error retrieving templates:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve templates',
                message: error instanceof Error ? error.message : error
            });
        }
    }
    async getTemplateById(req, res) {
        const { id } = req.params;
        const template = TemplateProcessor.getTemplateContent(id);
        if (!template) {
            res.status(404).json({ error: 'Template not found.' });
            return;
        }
        res.status(200).json({ success: true, data: template });
    }
}
