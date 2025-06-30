# Containerized Nginx Setup Guide for TTS Application

## Prerequisites
- Docker and Docker Compose installed
- Domain `tts.ignify.co` pointing to your server's IP address

## Setup Steps

### 1. Deploy the Complete Stack
The docker-compose file now includes both the TTS application and nginx:

```bash
# Navigate to your TTS project directory
cd /path/to/your/TTS/project

# Start both the TTS application and nginx
docker-compose -f docker-compose.nobuild.yml up -d

# Verify both containers are running
docker ps
```

### 2. Firewall Configuration
Make sure your firewall allows HTTP traffic:

```bash
# For UFW (Ubuntu)
sudo ufw allow 80/tcp

# For firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## Testing

1. **Local testing:**
   ```bash
   curl -H "Host: tts.ignify.co" http://localhost
   ```

2. **Remote testing:**
   ```bash
   curl http://tts.ignify.co
   ```

3. **Browser testing:**
   - Open `http://tts.ignify.co` in your browser

## Troubleshooting

### Check if services are running:
```bash
# Check both containers
docker ps

# Check specific containers
docker ps | grep vietnamese-tts
docker ps | grep tts-nginx

# Check container logs
docker logs tts-nginx
docker logs vietnamese-tts-app
```

### Common issues:
1. **502 Bad Gateway**: TTS application container not running or not accessible
2. **Domain not resolving**: DNS not configured properly
3. **Container startup issues**: Check logs with `docker logs <container_name>`

### Useful commands:
```bash
# Restart the entire stack
docker-compose -f docker-compose.nobuild.yml restart

# Restart specific service
docker-compose -f docker-compose.nobuild.yml restart nginx
docker-compose -f docker-compose.nobuild.yml restart vietnamese-tts

# View real-time logs
docker logs -f tts-nginx
docker logs -f vietnamese-tts-app

# Access nginx logs (stored in named volume)
docker exec tts-nginx tail -f /var/log/nginx/access.log
docker exec tts-nginx tail -f /var/log/nginx/error.log

# Test nginx configuration
docker exec tts-nginx nginx -t

# Reload nginx configuration (if you update nginx.conf)
docker-compose -f docker-compose.nobuild.yml restart nginx
```

## Configuration Details

The containerized setup includes:
- **TTS Service**: Runs on internal port 80, accessible only within the Docker network
- **Nginx Service**: Exposes port 80 to host, proxies to TTS service using service name `vietnamese-tts:80`
- **Shared Network**: Both containers communicate via `tts-network`
- **Persistent Logs**: Nginx logs stored in named volume `nginx-logs`
- **Static File Caching**: Optimized for better performance
- **Security Headers**: XSS protection, frame options, etc.
- **Timeout Settings**: Configured for potentially long TTS operations

## File Structure

Your project should have these files:
```
TTS/
├── docker-compose.nobuild.yml  # Updated with nginx service
├── nginx.conf                  # Nginx configuration
└── nginx-setup.md             # This guide
```

## Benefits of Containerized Approach

1. **No host nginx installation required**
2. **Everything managed through Docker Compose**
3. **Easy to scale and update**
4. **Better isolation and portability**
5. **Consistent environment across deployments** 