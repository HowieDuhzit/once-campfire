# LiveKit Meet Integration Plan

## Architecture Overview

Instead of building custom voice controls, we'll integrate [LiveKit Meet](https://github.com/HowieDuhzit/meet) - a complete video conferencing application built with LiveKit Components and Next.js. This gives Campfire users access to a full-featured video/voice conferencing experience.

## Integration Strategy

### Option 1: Embedded Iframe (Recommended)
- Meet runs as separate Next.js service
- Campfire generates tokens and embeds Meet in iframe
- Seamless experience within Campfire UI

### Option 2: Redirect Flow
- User clicks "Join Voice" → redirect to Meet with room context
- Meet handles full UI, redirects back to Campfire when done

### Option 3: Hybrid Approach
- Meet embedded in modal/overlay for voice-only
- Full Meet page redirect for video calls

**We'll implement Option 1 (Embedded Iframe) for the best UX.**

## Implementation Plan

### 1. Set Up LiveKit Meet Service

**Deploy Meet as Separate Service**
- Clone Meet repo: https://github.com/HowieDuhzit/meet
- Configure Meet to accept room name and token from URL params
- Deploy alongside Campfire (same server or separate)

**Docker Compose Setup**
```yaml
services:
  campfire:
    # ... existing Campfire config
  
  livekit-meet:
    image: node:20
    build:
      context: ./livekit-meet
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
```

### 2. Modify Campfire Voice Chat Flow

**Update Voice Chat Controller**
- Instead of returning token for direct connection
- Generate token and redirect/embed Meet with:
  - Room name (campfire-room-{room_id})
  - User identity
  - Token as URL param

**New Endpoint Structure**
```
GET /rooms/:room_id/voice_chat/join
  → Generates token
  → Redirects to: /voice-meet?room={room_id}&token={jwt}

OR

Returns iframe embed URL with token
```

### 3. Update Frontend

**Voice Controller Changes**
- Remove direct LiveKit client connection code
- Add iframe embed or redirect logic
- Show Meet UI instead of custom controls

**Room Navigation**
- "Join Voice/Video" button opens Meet in iframe overlay
- Or redirects to Meet page
- Back button returns to Campfire room

### 4. Token & Room Mapping

**Campfire Room → LiveKit Room**
- Format: `campfire-room-{room_id}`
- Consistent naming between services
- User identity: `user-{user_id}` or username

**Token Generation (Enhanced)**
- Include room name in token
- Set appropriate permissions (audio/video)
- Shorter expiration for security

### 5. User Experience Flow

1. User in Campfire room clicks "Join Voice"
2. Campfire generates LiveKit token
3. Meet loads in iframe/modal with:
   - Pre-filled room name
   - Pre-filled token
   - User identity
4. User controls via Meet UI (mute, video toggle, etc.)
5. When done, close overlay → return to Campfire room

## Technical Changes Required

### Backend (Campfire)

**Update `app/controllers/rooms/voice_chats_controller.rb`**
```ruby
def join
  token = LivekitService.generate_token(...)
  meet_url = "#{ENV['MEET_URL']}/?room=campfire-room-#{@room.id}&token=#{token}&identity=#{Current.user.name}"
  
  redirect_to meet_url
  # OR for iframe:
  # render json: { meet_url: meet_url, room_id: @room.id }
end
```

**New Route**
```ruby
get "/rooms/:room_id/voice_chat/join", to: "rooms/voice_chats#join", as: :join_voice_chat
```

### Frontend (Campfire)

**Update `app/views/rooms/voice_chats/_controls.html.erb`**
```erb
<div data-controller="voice-meet">
  <%= link_to join_voice_chat_path(room), 
      class: "btn", 
      data: { voice_meet_target: "joinButton" } do %>
    Join Voice/Video
  <% end %>
  
  <div data-voice-meet-target="meetContainer" class="hidden">
    <iframe src="" data-voice-meet-target="meetFrame"></iframe>
  </div>
</div>
```

**New Stimulus Controller `voice_meet_controller.js`**
- Handles iframe embed or redirect
- Manages overlay/modal state
- Syncs with Campfire presence

### Meet Configuration

**Modify Meet to accept params**
- Update Meet's room page to read:
  - `room` from URL param
  - `token` from URL param
  - `identity` from URL param
- Auto-connect when these are present
- Don't show room creation UI if pre-configured

## Benefits of This Approach

✅ **Full-Featured UI**: Meet provides complete video conferencing experience
✅ **Maintained**: Meet is actively developed by LiveKit
✅ **Consistent UX**: Users get familiar video conferencing interface
✅ **Less Code**: No need to build custom voice UI
✅ **Video Support**: Automatically get video chat, screen share, etc.
✅ **Component-Based**: Easy to customize Meet's UI if needed

## Migration from Current Implementation

1. Keep existing token generation code
2. Update voice chat controller to redirect to Meet
3. Remove custom voice controller JS (or repurpose for iframe)
4. Update room navigation to use Meet link
5. Test token passing between Campfire → Meet

## Deployment Considerations

- Meet can be deployed separately or alongside Campfire
- Shared LiveKit server credentials
- CORS configuration if Meet is on different domain
- Iframe embedding requires proper CSP headers

## Next Steps

1. Set up Meet as separate Next.js service
2. Modify Meet to accept room/token from URL
3. Update Campfire voice chat flow
4. Test end-to-end integration
5. Deploy both services
