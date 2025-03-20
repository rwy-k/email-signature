import { injectable } from "tsyringe";
import { Redis } from "ioredis";
import axios, { AxiosStatic } from "axios";
import Queue from "bull";
import { Producer } from "../queue/producer.js";
import { TemplateProcessor } from "./templateProcessor.js";
import { UserData, SignatureResponse } from "../types.js";

const axiosInstance = axios as unknown as AxiosStatic;
enum TemplateType {
  HTML = "HTML",
  TEXT = "TEXT",
}

const REDIS_OPTIONS = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  },
};

@injectable()
export class SignatureService {
  private producer: Producer;
  private redisClient: Redis | null;

  constructor() {
    try {
      const queue = new Queue("signature", {
        redis: REDIS_OPTIONS,
      });
      this.producer = new Producer(queue);
    } catch (error) {
      console.warn("Queue initialization failed:", error);
      // Initialize with null producer to prevent crashes
      this.producer = {
        sendMessage: async () => {
          console.warn("Queue not available, skipping message");
        },
      } as unknown as Producer;
    }

    try {
      this.redisClient = new Redis({
        ...REDIS_OPTIONS,
        enableOfflineQueue: false,
      });

      this.redisClient.on("error", (err) => {
        console.warn("Redis connection error:", err);
      });
    } catch (error) {
      console.warn("Redis connection failed, working without Redis:", error);
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
  public async generateSignature(
    templateId: string,
    userData: UserData,
    signatureType: TemplateType,
    webhookUrl?: string,
  ): Promise<SignatureResponse> {
    const cacheKey = `signature:${userData.userId || "anonymous"}-${templateId}-${signatureType}`;

    try {
      if (this.redisClient && this.redisClient.status === "ready") {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const processedTemplate =
        signatureType === TemplateType.TEXT
          ? TemplateProcessor.renderPlainText(userData)
          : TemplateProcessor.renderHtml(templateId, userData);

      const response: SignatureResponse = {
        success: true,
        data: processedTemplate,
        userId: userData.userId || "anonymous",
        templateId,
        timestamp: new Date().toISOString(),
      };

      if (webhookUrl) {
        await this.sendToWebhook(webhookUrl, response);
      } else {
        // Send to queue if no webhook is provided
        this.producer
          .sendMessage({
            type: "signature_generated",
            payload: response,
          })
          .catch((error) => {
            console.warn("Failed to queue message:", error);
          });
      }

      console.debug("Signature generated:", response.timestamp);

      // Cache with TTL (1 hour)
      if (this.redisClient?.status === "ready") {
        try {
          await this.redisClient.set(
            `signature:${templateId}:${JSON.stringify(userData)}`,
            JSON.stringify(response),
            "EX",
            3600,
          );
        } catch (cacheError) {
          console.warn("Failed to cache signature:", cacheError);
        }
      }

      console.debug("Signature cached:", cacheKey);

      return response;
    } catch (error) {
      console.error("Error generating signature:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate signature: ${error.message}`);
      } else {
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
  public async generateSignatureBatch(
    templateId: string,
    usersData: UserData[],
    signatureType: TemplateType,
    webhookUrl?: string,
  ): Promise<void> {
    try {
      // Process in chunks of 10 users
      const chunkSize = 10;
      for (let i = 0; i < usersData.length; i += chunkSize) {
        const chunk = usersData.slice(i, i + chunkSize);
        const promises = chunk.map((userData) =>
          this.generateSignature(
            templateId,
            userData,
            signatureType,
            webhookUrl,
          ),
        );
        await Promise.all(promises);
      }
      return;
    } catch (error) {
      console.error("Error generating signatures in batch:", error);
      throw new Error(
        `Failed to generate signatures in batch: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Send the generated signature to a webhook URL
   * @param webhookUrl The URL to send the data to
   * @param data The signature data to send
   * @returns Promise that resolves when the HTTP request is complete
   */
  private async sendToWebhook(webhookUrl: string, data: any): Promise<void> {
    try {
      const response = await axiosInstance.post(webhookUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Webhook returned status ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);

      // Re-queue the message for later retry
      await this.producer.sendMessage({
        type: "webhook_failed",
        payload: {
          webhookUrl,
          data,
          error: error instanceof Error ? error.message : error,
          retryCount: 0,
        },
      });

      throw new Error(
        `Failed to send to webhook: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
