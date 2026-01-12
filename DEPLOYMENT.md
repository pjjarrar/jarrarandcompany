# Digital Ocean Droplet Deployment Guide

This guide will help you deploy the Jarrar & Company website to a Digital Ocean droplet.

## Prerequisites

- A Digital Ocean account
- A domain name (optional but recommended)
- Basic knowledge of Linux command line

## Step 1: Create a Digital Ocean Droplet

1. Log in to your Digital Ocean account
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Ubuntu 22.04 LTS (or latest LTS)
   - **Plan**: Basic plan (minimum 1GB RAM recommended)
   - **Datacenter region**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or root password
4. Click "Create Droplet"

## Step 2: Initial Server Setup

### Connect to your droplet

```bash
ssh root@your-droplet-ip
```

### Update system packages

```bash
apt update && apt upgrade -y
```

### Create a non-root user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## Step 3: Install Node.js

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Step 6: Deploy Your Application

### Option A: Using Git (Recommended)

```bash
# Install Git
sudo apt install -y git

# Clone your repository
cd /var/www
sudo git clone https://github.com/your-username/your-repo.git jarrar-website
sudo chown -R $USER:$USER jarrar-website
cd jarrar-website

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### Option B: Using SCP/SFTP

```bash
# On your local machine
scp -r /path/to/website root@your-droplet-ip:/var/www/jarrar-website

# On the server
cd /var/www/jarrar-website
chmod +x deploy.sh
./deploy.sh
```

## Step 7: Configure Environment Variables

```bash
cd /var/www/jarrar-website
nano .env
```

Update the following variables:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-very-secure-random-string-here
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

**Important**: After updating `.env`, restart the application:

```bash
pm2 restart jarrar-website
```

## Step 8: Configure Nginx

1. Copy the Nginx configuration:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/jarrar-website
```

2. Edit the configuration file:

```bash
sudo nano /etc/nginx/sites-available/jarrar-website
```

Replace `your-domain.com` with your actual domain name (or use your droplet IP if no domain).

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/jarrar-website /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

4. Test Nginx configuration:

```bash
sudo nginx -t
```

5. Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Step 9: Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if using SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Step 10: Setup SSL Certificate (Optional but Recommended)

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically update your Nginx configuration
# Follow the prompts and choose to redirect HTTP to HTTPS
```

After SSL setup, uncomment the HTTPS server block in your Nginx config and comment out the HTTP redirect.

## Step 11: Verify Deployment

1. Check PM2 status:

```bash
pm2 status
pm2 logs jarrar-website
```

2. Check Nginx status:

```bash
sudo systemctl status nginx
```

3. Visit your website:
   - If using domain: `http://your-domain.com` or `https://your-domain.com`
   - If using IP: `http://your-droplet-ip`

## Maintenance Commands

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs jarrar-website

# Restart application
pm2 restart jarrar-website

# Stop application
pm2 stop jarrar-website

# View monitoring dashboard
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

```bash
# Backup SQLite database
cp /var/www/jarrar-website/database.db /var/www/jarrar-website/backups/database-$(date +%Y%m%d-%H%M%S).db

# Create backups directory
mkdir -p /var/www/jarrar-website/backups
```

## Updating the Application

```bash
cd /var/www/jarrar-website

# If using Git
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install --production

# Restart application
pm2 restart jarrar-website
```

## Troubleshooting

### Application won't start

1. Check PM2 logs: `pm2 logs jarrar-website`
2. Check if port 3000 is in use: `sudo lsof -i :3000`
3. Verify .env file exists and has correct values
4. Check database permissions: `ls -la database.db`

### Nginx 502 Bad Gateway

1. Check if application is running: `pm2 status`
2. Check application logs: `pm2 logs jarrar-website`
3. Verify Nginx proxy_pass points to correct port
4. Check firewall: `sudo ufw status`

### Can't access website

1. Check firewall: `sudo ufw status`
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify DNS settings (if using domain)

## Security Recommendations

1. **Change default admin password** after first login
2. **Use strong JWT_SECRET** - generate with `openssl rand -base64 32`
3. **Enable firewall** (UFW) and only allow necessary ports
4. **Setup SSL/HTTPS** for encrypted connections
5. **Keep system updated**: `sudo apt update && sudo apt upgrade`
6. **Use SSH keys** instead of passwords for authentication
7. **Regular backups** of database.db file
8. **Monitor logs** regularly for suspicious activity

## File Structure

```
/var/www/jarrar-website/
├── server.js
├── database.js
├── database.db
├── package.json
├── ecosystem.config.js
├── .env
├── logs/
│   ├── pm2-error.log
│   └── pm2-out.log
└── [other project files]
```

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs jarrar-website`
- Nginx logs: `/var/log/nginx/error.log`
- Application logs in `logs/` directory



