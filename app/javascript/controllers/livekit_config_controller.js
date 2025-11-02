import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["apiKey", "apiSecret", "host", "httpUrl", "enabled", "testButton"]

  connect() {
    this.updateTestButtonState()
  }

  updateTestButtonState() {
    if (!this.hasTestButtonTarget) return
    
    const hasRequiredFields = this.hasRequiredFields()
    this.testButtonTarget.disabled = !hasRequiredFields
    
    if (hasRequiredFields) {
      this.testButtonTarget.classList.remove('btn--disabled')
    } else {
      this.testButtonTarget.classList.add('btn--disabled')
    }
  }

  hasRequiredFields() {
    return this.apiKeyTarget.value.trim() !== '' &&
           this.apiSecretTarget.value.trim() !== '' &&
           this.hostTarget.value.trim() !== ''
  }

  // Called when any input changes
  validateInput() {
    this.updateTestButtonState()
  }

  // Auto-generate HTTP URL from WebSocket host
  generateHttpUrl() {
    const host = this.hostTarget.value.trim()
    if (host && !this.httpUrlTarget.value.trim()) {
      const httpUrl = host.replace(/^wss?:\/\//, 'https://').replace(/^ws:\/\//, 'http://')
      this.httpUrlTarget.value = httpUrl
    }
  }

  // Called when host input changes
  onHostChange() {
    this.generateHttpUrl()
    this.validateInput()
  }
}

