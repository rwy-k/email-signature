var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from 'tsyringe';
import { Redis } from 'ioredis';
import axios from 'axios';
import Queue from 'bull';
import { Producer } from '../queue/producer.js';
import { TemplateProcessor } from './templateProcessor.js';
const axiosInstance = axios;
var TemplateType;
(function (TemplateType) {
    TemplateType["HTML"] = "HTML";
    TemplateType["TEXT"] = "TEXT";
})(TemplateType || (TemplateType = {}));
const REDIS_OPTIONS = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3)
            return null;
        return Math.min(times * 100, 3000);
    }
};
let SignatureService = class SignatureService {
    constructor() {
        try {
            const queue = new Queue('signature', {
                redis: REDIS_OPTIONS
            });
            this.producer = new Producer(queue);
        }
        catch (error) {
            console.warn('Queue initialization failed:', error);
            // Initialize with null producer to prevent crashes
            this.producer = {
                sendMessage: async () => {
                    console.warn('Queue not available, skipping message');
                }
            };
        }
        try {
            this.redisClient = new Redis({
                ...REDIS_OPTIONS,
                enableOfflineQueue: false,
            });
            this.redisClient.on('error', (err) => {
                console.warn('Redis connection error:', err);
            });
        }
        catch (error) {
            console.warn('Redis connection failed, working without Redis:', error);
            this.redisClient = null;
        }
    }
    /**
     * Generate an email signature based on a template and user data
     * @param templateId The ID or name of the template to use
     * @param userData User's personal information to populate the template
     * @param signatureType Optional type of signature to generate (HTML or plain text)
     * @param webhookUrl Optional URL to send the generated signature to
     * @returns Promise that resolves when processing is complete
     */
    async generateSignature(templateId, userData, signatureType, webhookUrl) {
        const cacheKey = `signature:${userData.userId || 'anonymous'}-${templateId}-${signatureType}`;
        try {
            if (this.redisClient && this.redisClient.status === 'ready') {
                const cached = await this.redisClient.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            const processedTemplate = signatureType === TemplateType.TEXT
                ? TemplateProcessor.renderPlainText(userData)
                : TemplateProcessor.renderHtml(templateId, userData);
            const response = {
                success: true,
                data: processedTemplate,
                userId: userData.userId || 'anonymous',
                templateId,
                timestamp: new Date().toISOString()
            };
            if (webhookUrl) {
                await this.sendToWebhook(webhookUrl, response);
            }
            else {
                // Send to queue if no webhook is provided
                this.producer.sendMessage({
                    type: 'signature_generated',
                    payload: response
                }).catch(error => {
                    console.warn('Failed to queue message:', error);
                });
            }
            console.debug('Signature generated:', response.timestamp);
            // Cache with TTL (1 hour)
            if (this.redisClient?.status === 'ready') {
                try {
                    await this.redisClient.set(`signature:${templateId}:${JSON.stringify(userData)}`, JSON.stringify(response), 'EX', 3600);
                }
                catch (cacheError) {
                    console.warn('Failed to cache signature:', cacheError);
                }
            }
            console.debug('Signature cached:', cacheKey);
            return response;
        }
        catch (error) {
            console.error('Error generating signature:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to generate signature: ${error.message}`);
            }
            else {
                throw new Error(`Failed to generate signature: ${error}`);
            }
        }
    }
    /**
     * Generate signatures in batch for multiple users
     * @param templateId The ID or name of the template to use
     * @param usersData Array of user data objects
     * @param webhookUrl Optional URL to send the generated signatures to
     * @returns Promise that resolves when all processing is complete
     */
    async generateSignatureBatch(templateId, usersData, signatureType, webhookUrl) {
        try {
            // Process in chunks of 10 users
            const chunkSize = 10;
            for (let i = 0; i < usersData.length; i += chunkSize) {
                const chunk = usersData.slice(i, i + chunkSize);
                const promises = chunk.map(userData => this.generateSignature(templateId, userData, signatureType, webhookUrl));
                await Promise.all(promises);
            }
            return;
        }
        catch (error) {
            console.error('Error generating signatures in batch:', error);
            throw new Error(`Failed to generate signatures in batch: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Send the generated signature to a webhook URL
     * @param webhookUrl The URL to send the data to
     * @param data The signature data to send
     * @returns Promise that resolves when the HTTP request is complete
     */
    async sendToWebhook(webhookUrl, data) {
        try {
            const response = await axiosInstance.post(webhookUrl, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Webhook returned status ${response.status}`);
            }
        }
        catch (error) {
            console.error('Error sending to webhook:', error);
            // Re-queue the message for later retry
            await this.producer.sendMessage({
                type: 'webhook_failed',
                payload: {
                    webhookUrl,
                    data,
                    error: error instanceof Error ? error.message : error,
                    retryCount: 0
                }
            });
            throw new Error(`Failed to send to webhook: ${error instanceof Error ? error.message : error}`);
        }
    }
};
SignatureService = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], SignatureService);
export { SignatureService };
