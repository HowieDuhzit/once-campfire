# Campfire with LiveKit Voice Chat - Deployment Guide

## Quick Start

1. **Pull the image:**
   ```bash
   docker pull howieduhzit/campfire-livekit:latest
   ```

2. **Create environment file:**
   ```bash
   cat > .env << EOF
   SECRET_KEY_BASE=your_secret_key_here
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   LIVEKIT_HOST=wss://your-livekit-server.com
   LIVEKIT_HTTP_URL=https://your-livekit-server.com
   EOF
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

## Environment Variables

- `SECRET_KEY_BASE` - Rails secret key (generate with `rails secret`)
- `LIVEKIT_API_KEY` - Your LiveKit server API key
- `LIVEKIT_API_SECRET` - Your LiveKit server API secret
- `LIVEKIT_HOST` - WebSocket URL for LiveKit server (e.g., `wss://livekit.example.com`)
- `LIVEKIT_HTTP_URL` - HTTP URL for LiveKit API (e.g., `https://livekit.example.com`)

## Features Included

✅ **LiveKit Voice Chat Integration**
- Voice controls in room navigation
- Join/leave voice chat
- Mute/unmute functionality
- Real-time participant presence
- Admin configuration screen

✅ **Database Schema**
- Voice chat enabled flag for rooms
- Voice participation tracking for memberships
- LiveKit configuration for accounts

✅ **API Endpoints**
- `POST /rooms/:id/voice_chat` - Join voice chat
- `DELETE /rooms/:id/voice_chat/leave` - Leave voice chat
- `POST /livekit/webhook` - LiveKit webhook handler
- `GET /account/livekit_config` - Admin configuration

## Testing Voice Chat

1. **Access the application** at `http://your-server:3000`
2. **Create an account** and log in
3. **Go to Account Settings** and click the microphone icon to configure LiveKit
4. **Enter your LiveKit credentials** and enable voice chat
5. **Create or join a room** and look for the voice chat controls in the room header
6. **Click "Join Voice"** to test the voice chat functionality

## Webhook Configuration

Configure your LiveKit server to send webhooks to:
```
http://your-server:3000/livekit/webhook
```

This enables real-time presence updates when users join/leave voice chat.

## Troubleshooting

- Check logs: `docker-compose -f docker-compose.production.yml logs campfire`
- Ensure LiveKit server is running and accessible
- Verify environment variables are set correctly
- Check that the webhook URL is accessible from your LiveKit server

## Development

For local development, use the included `docker-compose.yml` file which includes development settings and volume mounts.

