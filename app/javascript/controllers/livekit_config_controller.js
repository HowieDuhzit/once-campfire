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

  async testConnection(event) {
    event.preventDefault()

    if (!this.hasTestButtonTarget) return

    const button = this.testButtonTarget
    const originalText = button.innerHTML
    const originalDisabled = button.disabled

    button.disabled = true
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Testing...
    `

    try {
      const response = await fetch("/account/livekit_config/test_connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
        }
      })

      const data = await response.json()

      if (data.success) {
        this.showStatus("Connection successful! ✓", "success")
        button.classList.remove("btn--tertiary")
        button.classList.add("btn--success")
      } else {
        this.showStatus(`Connection failed: ${data.message}`, "error")
        button.classList.remove("btn--tertiary")
        button.classList.add("btn--error")
      }
    } catch (error) {
      console.error("Test connection error:", error)
      this.showStatus("Connection test failed. Please check your settings.", "error")
      button.classList.remove("btn--tertiary")
      button.classList.add("btn--error")
    } finally {
      setTimeout(() => {
        button.disabled = originalDisabled
        button.innerHTML = originalText
        button.classList.remove("btn--success", "btn--error")
        button.classList.add("btn--tertiary")
      }, 3000)
    }
  }

  showStatus(message, type = "info") {
    let statusElement = this.element.querySelector("[data-livekit-config-target='status']")
    if (!statusElement) {
      statusElement = document.createElement("div")
      statusElement.setAttribute("data-livekit-config-target", "status")
      statusElement.className = "livekit-status-message"
      this.element.appendChild(statusElement)
    }

    statusElement.textContent = message
    statusElement.className = `livekit-status-message livekit-status-message--${type}`

    setTimeout(() => {
      statusElement.remove()
    }, 5000)
  }
}
