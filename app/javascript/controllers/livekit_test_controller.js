import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["testButton", "status"]

  async testConnection(event) {
    event.preventDefault()
    
    const button = this.hasTestButtonTarget ? this.testButtonTarget : event.target
    const originalText = button.innerHTML
    const originalDisabled = button.disabled
    
    // Show loading state
    button.disabled = true
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Testing...
    `
    
    try {
      const response = await fetch('/account/livekit_config/test_connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.showStatus('Connection successful! ✓', 'success')
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Connection Successful
        `
        button.classList.remove('btn--tertiary')
        button.classList.add('btn--success')
      } else {
        this.showStatus(`Connection failed: ${data.message}`, 'error')
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          Connection Failed
        `
        button.classList.remove('btn--tertiary')
        button.classList.add('btn--error')
      }
    } catch (error) {
      console.error('Test connection error:', error)
      this.showStatus('Connection test failed. Please check your settings.', 'error')
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        Test Failed
      `
      button.classList.remove('btn--tertiary')
      button.classList.add('btn--error')
    } finally {
      // Reset button after 3 seconds
      setTimeout(() => {
        button.disabled = originalDisabled
        button.innerHTML = originalText
        button.classList.remove('btn--success', 'btn--error')
        button.classList.add('btn--tertiary')
      }, 3000)
    }
  }

  showStatus(message, type = 'info') {
    // Create or update status message
    let statusElement = document.querySelector('[data-livekit-test-target="status"]')
    if (!statusElement) {
      statusElement = document.createElement('div')
      statusElement.setAttribute('data-livekit-test-target', 'status')
      statusElement.className = 'livekit-status-message'
      this.element.appendChild(statusElement)
    }
    
    statusElement.textContent = message
    statusElement.className = `livekit-status-message livekit-status-message--${type}`
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (statusElement) {
        statusElement.remove()
      }
    }, 5000)
  }
}

