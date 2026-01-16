import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["joinButton", "container", "iframe", "closeButton", "participantCount"]
  static values = { roomId: Number, meetOrigin: String }

  connect() {
    console.log("VoiceMeetController connected for room", this.roomIdValue)
    this.boundHandleMeetMessage = this.handleMeetMessage.bind(this)
    window.addEventListener("message", this.boundHandleMeetMessage)
    
    // Check if we're in iframe mode
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("embed") === "true") {
      this.loadMeetInIframe()
    }
  }

  disconnect() {
    if (this.boundHandleMeetMessage) {
      window.removeEventListener("message", this.boundHandleMeetMessage)
    }
  }

  async loadMeetInIframe() {
    try {
      this.trackVoiceJoin()

      // Fetch the Meet URL from the backend  
      const response = await fetch(`/rooms/${this.roomIdValue}/voice_chat/join?embed=true&format=json`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to get Meet URL")
      }
      
      const data = await response.json()
      
      // Show container if hidden
      if (this.hasContainerTarget) {
        this.containerTarget.classList.remove("hidden")
      }
      
      // Load Meet in iframe
      if (this.hasIframeTarget) {
        this.iframeTarget.src = data.meet_url
      }
    } catch (error) {
      console.error("Failed to load Meet:", error)
      alert("Failed to load voice/video chat. Please try again.")
    }
  }

  openInNewWindow(event) {
    // Let the link navigate normally (target="_blank" already set)
    // Track that user is joining voice
    this.trackVoiceJoin()
  }

  close() {
    // Close iframe and return to room view
    if (this.hasContainerTarget) {
      this.containerTarget.classList.add("hidden")
    }

    if (this.hasIframeTarget) {
      this.iframeTarget.src = ""
    }
    
    // Notify that user left voice
    this.trackVoiceLeave()
    
    // Optionally reload room view
    window.location.reload()
  }

  trackVoiceJoin() {
    // Optionally track analytics or update UI
    console.log("User joining voice for room", this.roomIdValue)
  }

  trackVoiceLeave() {
    // Notify backend that user left
    fetch(`/rooms/${this.roomIdValue}/voice_chat/leave`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
      }
    }).catch(error => {
      console.error("Failed to track voice leave:", error)
    })
  }

  // Handle messages from Meet iframe (postMessage)
  handleMeetMessage(event) {
    // Validate origin if needed
    if (this.hasMeetOriginValue && event.origin !== this.meetOriginValue) {
      return
    }
    
    const data = event.data
    switch (data.type) {
      case "meet-ready":
        console.log("Meet loaded successfully")
        break
      case "meet-closed":
        this.close()
        break
      case "participant-count":
        this.updateParticipantCount(data.count)
        break
    }
  }

  updateParticipantCount(count) {
    if (this.hasParticipantCountTarget) {
      this.participantCountTarget.textContent = count
      this.participantCountTarget.style.display = count > 0 ? "inline-flex" : "none"
    }
  }
}
