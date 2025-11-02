import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static targets = ["participantsList", "participantCount", "status"]
  static values = { roomId: String }

  connect() {
    this.participants = new Map()
    this.subscribeToVoicePresence()
  }

  disconnect() {
    this.unsubscribeFromVoicePresence()
  }

  subscribeToVoicePresence() {
    this.consumer = createConsumer()
    this.subscription = this.consumer.subscriptions.create(
      { 
        channel: "VoicePresenceChannel", 
        room_id: this.roomIdValue 
      },
      {
        received: (data) => {
          this.handleVoicePresenceUpdate(data)
        },
        
        connected: () => {
          console.log("Connected to voice presence channel")
        },
        
        disconnected: () => {
          console.log("Disconnected from voice presence channel")
        }
      }
    )
  }

  unsubscribeFromVoicePresence() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.consumer) {
      this.consumer.disconnect()
    }
  }

  handleVoicePresenceUpdate(data) {
    switch (data.type) {
      case 'current_participants':
        this.updateCurrentParticipants(data.participants)
        break
      case 'participant_joined':
        this.addParticipant(data.user_id, data.user_name, data.timestamp)
        break
      case 'participant_left':
        this.removeParticipant(data.user_id)
        break
      case 'track_published':
        this.updateParticipantSpeaking(data.user_id, true)
        break
      case 'track_unpublished':
        this.updateParticipantSpeaking(data.user_id, false)
        break
      case 'room_finished':
        this.clearAllParticipants()
        break
    }
  }

  updateCurrentParticipants(participants) {
    this.participants.clear()
    participants.forEach(participant => {
      this.participants.set(participant.user_id, {
        id: participant.user_id,
        name: participant.user_name,
        joined_at: participant.joined_at,
        isSpeaking: false,
        isMuted: false
      })
    })
    this.updateUI()
  }

  addParticipant(userId, userName, timestamp) {
    this.participants.set(userId, {
      id: userId,
      name: userName,
      joined_at: timestamp,
      isSpeaking: false,
      isMuted: false
    })
    this.updateUI()
  }

  removeParticipant(userId) {
    this.participants.delete(userId)
    this.updateUI()
  }

  updateParticipantSpeaking(userId, isSpeaking) {
    const participant = this.participants.get(userId)
    if (participant) {
      participant.isSpeaking = isSpeaking
      this.updateUI()
    }
  }

  updateUI() {
    this.updateParticipantsList()
    this.updateParticipantCount()
  }

  updateParticipantsList() {
    if (!this.hasParticipantsListTarget) return
    
    const participants = Array.from(this.participants.values())
    
    this.participantsListTarget.innerHTML = participants.map(participant => `
      <div class="voice-participant ${participant.isSpeaking ? 'speaking' : ''} ${participant.isMuted ? 'muted' : ''}">
        <span class="participant-name">${participant.name}</span>
        <span class="participant-status">
          ${participant.isSpeaking ? '🎤' : ''} ${participant.isMuted ? '🔇' : ''}
        </span>
      </div>
    `).join('')
  }

  updateParticipantCount() {
    if (this.hasParticipantCountTarget) {
      const count = this.participants.size
      this.participantCountTarget.textContent = count
      this.participantCountTarget.style.display = count > 0 ? 'inline-block' : 'none'
    }
  }

  clearAllParticipants() {
    this.participants.clear()
    this.updateUI()
  }
}

