<template>
  <div>
    <h1>Email Signature Generator</h1>
    <p>Choose a desired email template below</p>
  </div>

  <div class="template-wrapper">
    <div class="left-column">
      <div class="user-data-form">
        <h3>Your Information</h3>
        <form @submit.prevent="previewSignature">
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              Update Preview
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              Reset Form
            </button>
          </div>

          <div class="form-section">
            <h4>Personal Information</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Full Name*</label>
                <input
                  type="text"
                  id="fullName"
                  v-model="userData.fullName"
                  required
                />
              </div>
              <div class="form-group">
                <label for="jobTitle">Job Title*</label>
                <input
                  type="text"
                  id="jobTitle"
                  v-model="userData.jobTitle"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="profilePhoto">Profile Photo URL</label>
              <input
                type="text"
                id="profilePhoto"
                v-model="userData.profilePhoto"
                placeholder="https://example.com/photo.jpg"
              />
              <small>Leave blank to use default image</small>
            </div>
          </div>

          <div class="form-section">
            <h4>Company Information</h4>
            <div class="form-group">
              <label for="companyName">Company Name*</label>
              <input
                type="text"
                id="companyName"
                v-model="userData.companyName"
                required
              />
            </div>

            <div class="form-group">
              <label for="companyAddress">Company Address</label>
              <input
                type="text"
                id="companyAddress"
                v-model="userData.companyAddress"
              />
            </div>

            <div class="form-group">
              <label for="companyLogo">Company Logo URL</label>
              <input
                type="text"
                id="companyLogo"
                v-model="userData.companyLogo"
              />
              <small>Only used in certain templates</small>
            </div>
          </div>

          <div class="form-section">
            <h4>Contact Information</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" v-model="userData.phone" />
              </div>
              <div class="form-group">
                <label for="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  v-model="userData.email"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="website">Website</label>
                <input
                  type="text"
                  id="website"
                  v-model="userData.website"
                  placeholder="www.example.com"
                />
              </div>
              <div class="form-group">
                <label for="websiteUrl">Website Full URL</label>
                <input
                  type="text"
                  id="websiteUrl"
                  v-model="userData.websiteUrl"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Social Media</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="linkedin">LinkedIn</label>
                <input
                  type="text"
                  id="linkedin"
                  v-model="userData.socialLinks.linkedin"
                />
              </div>
              <div class="form-group">
                <label for="twitter">Twitter</label>
                <input
                  type="text"
                  id="twitter"
                  v-model="userData.socialLinks.twitter"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="facebook">Facebook</label>
                <input
                  type="text"
                  id="facebook"
                  v-model="userData.socialLinks.facebook"
                />
              </div>
              <div class="form-group">
                <label for="instagram">Instagram</label>
                <input
                  type="text"
                  id="instagram"
                  v-model="userData.socialLinks.instagram"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Personalization</h4>
            <div class="form-group">
              <label for="accentColor">Accent Color</label>
              <div class="color-input-wrapper">
                <input
                  type="color"
                  id="accentColor"
                  v-model="userData.accentColor"
                />
                <span class="color-value">{{ userData.accentColor }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="tagline">Tagline/Motto</label>
              <input
                type="text"
                id="tagline"
                v-model="userData.tagline"
                placeholder="Your company slogan or personal motto"
              />
            </div>

            <div class="form-group">
              <label for="disclaimer">Disclaimer</label>
              <textarea
                id="disclaimer"
                v-model="userData.disclaimer"
                rows="2"
              ></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="right-column">
      <div class="templates-container">
        <h3>Templates</h3>
        <div v-if="templatesLoading" class="templates-loading">
          <Loader message="Loading templates..." />
        </div>
        <div v-else-if="templatesError" class="templates-error">
          <p class="error-message">{{ templatesError }}</p>
          <button @click="fetchTemplates" class="btn btn-secondary">
            Try Again
          </button>
        </div>
        <div v-else class="templates-grid">
          <div
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            :class="{ selected: selectedTemplate === template.id }"
            @click="selectTemplate(template.id)"
          >
            <p class="template-description">{{ template.id }}</p>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <h3>Preview</h3>
        <div v-if="loading" class="preview-loading">
          <Loader message="Generating preview..." />
        </div>

        <div v-else-if="error" class="preview-error">
          <p class="error-message">{{ error }}</p>
        </div>
        <div
          v-else-if="previewHtml"
          v-html="previewHtml"
          class="template-preview"
        ></div>
        <div v-else class="template-preview empty-preview">
          <p>Select a template and fill in your information to see a preview</p>
        </div>
      </div>

      <div class="signature-actions">
        <button
          @click="generateSignature(TemplateType.HTML)"
          class="btn btn-secondary"
          :disabled="generatingSignature || !selectedTemplate"
        >
          Generate Signature HTML
        </button>
        <button
          @click="generateSignature(TemplateType.Text)"
          class="btn btn-secondary"
          :disabled="generatingSignature || !selectedTemplate"
        >
          Generate Plain Text
        </button>
      </div>
      <Loader v-if="generatingSignature" message="Generating signature..." />
    </div>
  </div>

  <Loader
    v-if="fullscreenLoading"
    fullscreen
    message="Processing your request..."
  />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import api, { Template, SignatureData, TemplateType } from "../api";
import ejs from "ejs";
import { defaultUsersData } from "../constants";
import Loader from "../components/Loader.vue";

export default defineComponent({
  name: "Home",
  components: {
    Loader,
  },
  setup() {
    const templates = ref<Template[]>([]);
    const selectedTemplate = ref<string>("");
    const userData = ref<SignatureData>(defaultUsersData);
    const previewHtml = ref<string>("");

    const loading = ref<boolean>(false);
    const templatesLoading = ref<boolean>(false);
    const generatingSignature = ref<boolean>(false);
    const fullscreenLoading = ref<boolean>(false);
    const error = ref<string | null>(null);
    const templatesError = ref<string | null>(null);

    const fetchTemplates = async () => {
      templatesLoading.value = true;
      templatesError.value = null;

      try {
        templates.value = await api.templates.fetchTemplates();

        if (templates.value.length > 0) {
          selectedTemplate.value = templates.value[0].id;
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        templatesError.value = "Failed to load templates. Please try again.";
      } finally {
        templatesLoading.value = false;
      }
    };

    const resetForm = () => {
      userData.value = Object.assign({}, defaultUsersData);

      previewSignature();
      error.value = null;
    };

    const selectTemplate = async (templateId: string) => {
      selectedTemplate.value = templateId;
    };

    const previewSignature = () => {
      try {
        previewHtml.value = ejs.render(
          templates.value.find((t) => t.id === selectedTemplate.value)
            ?.content || "",
          userData.value,
        );
      } catch (err) {
        console.error("Error previewing signature:", err);
        error.value = "Failed to preview signature. Please try again.";
        previewHtml.value = "";
      }
    };

    const generateSignature = async (signatureType: TemplateType) => {
      if (generatingSignature.value) {
        return;
      }
      if (!selectedTemplate.value) {
        error.value = "Please select a template.";
        return;
      }

      generatingSignature.value = true;

      try {
        const result = await api.signatures.generateSignature(
          selectedTemplate.value,
          userData.value,
          signatureType,
        );

        // Download the signature as a text file
        // for test purposes
        const blob = new Blob([result as unknown as BlobPart], {
          type: "text/plain",
        });

        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");

        console.log("Signature generated:", result);
      } catch (err) {
        console.error("Error generating signature:", err);
        error.value = "Failed to generate signature. Please try again.";
      } finally {
        generatingSignature.value = false;
      }
    };

    watch(
      () => selectedTemplate,
      () => {
        previewSignature();
      },
      { deep: true },
    );

    onMounted(() => {
      fetchTemplates();
    });

    return {
      templates,
      selectedTemplate,
      userData,
      previewHtml,
      loading,
      error,
      previewSignature,
      generateSignature,
      resetForm,
      selectTemplate,
      templatesLoading,
      templatesError,
      fullscreenLoading,
      generatingSignature,
      fetchTemplates,
      TemplateType,
    };
  },
});
</script>

<style scoped>
.template-wrapper {
  max-width: 90vw;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.left-column,
.right-column {
  width: 40%;
}

.templates-container {
  margin: 0 0 30px 0;
}

h3 {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.template-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.template-card:hover {
  border-color: #bbb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-card.selected {
  border-color: #0079c1;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.template-card h4 {
  margin: 0;
  font-size: 14px;
}

.template-preview {
  border: 1px solid #ddd;
  padding: 20px;
  background-color: #f9f9f9;
  margin-top: 10px;
  max-width: 650px;
}

.template-preview :deep(*) {
  max-width: 600px;
}

/* Form styles */
.user-data-form {
  margin-top: 30px;
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #555;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.form-group {
  flex: 1;
  min-width: 200px;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

input,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus,
textarea:focus {
  border-color: #0079c1;
  outline: none;
}

small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #777;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
}

input[type="color"] {
  width: 50px;
  height: 30px;
  padding: 2px;
  margin-right: 10px;
}

.color-value {
  font-family: monospace;
  font-size: 13px;
}

.form-actions {
  margin-block: 20px;
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.signature-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

/* Button styles */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: calc(50% - 1em);
}

.btn-primary {
  background-color: #0079c1;
  color: white;
}

.btn-primary:hover {
  background-color: #006099;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

@media (max-width: 960px) {
  .template-wrapper {
    flex-direction: column;
  }

  .left-column,
  .right-column {
    width: 100%;
  }

  .templates-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
