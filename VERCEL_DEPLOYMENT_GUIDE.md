# Complete Vercel Deployment & Administration Guide
**Portfolio of Vamshi Budida — AI + Full Stack Engineer**

This guide provides step-by-step instructions to deploy your portfolio live on **Vercel**, configure direct email delivery to your inbox (`vamshiyadav1905@gmail.com`), connect a custom domain, and manage your portfolio via the new **Admin Portal**.

---

## Table of Contents
1. [Overview & Tech Architecture](#1-overview--tech-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Push Code to GitHub](#3-step-1-push-code-to-github)
4. [Step 2: Deploy to Vercel (1-Click Import)](#4-step-2-deploy-to-vercel-1-click-import)
5. [Step 3: Setup Free Email Delivery to Your Inbox](#5-step-3-setup-free-email-delivery-to-your-inbox)
6. [Step 4: Using the Admin Portal](#6-step-4-using-the-admin-portal)
   - [Accessing the Portal](#accessing-the-portal)
   - [Updating the Resume Link](#updating-the-resume-link)
   - [Changing the Admin Password](#changing-the-admin-password)
7. [Step 5: Adding a Custom Domain (Optional)](#7-step-5-adding-a-custom-domain-optional)
8. [Step 6: Continuous Deployment (Auto-Redeploy on Push)](#8-step-6-continuous-deployment-auto-redeploy-on-push)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Overview & Tech Architecture
Your portfolio is built with high-performance Vanilla HTML5, CSS3, ES6 JavaScript, and WebGL Three.js. 

- **Hosting**: Deployed on Vercel's global Edge CDN for sub-second load times worldwide.
- **Admin Portal**: Client-side authenticated dashboard (`Ctrl+Shift+A`) with SHA-256 hashed credentials.
- **Dynamic Resume Sync**: Immediate DOM updating across all resume download buttons with persistent storage.
- **Contact Form**: Direct AJAX delivery to `vamshiyadav1905@gmail.com` via Web3Forms API with instant user feedback.

---

## 2. Prerequisites
1. **GitHub Account**: [github.com/vamshiyadav-06](https://github.com/vamshiyadav-06)
2. **Git**: Installed on your computer (`git --version`)
3. **Vercel Account**: Sign up for free at [vercel.com](https://vercel.com) using your GitHub account.

---

## 3. Step 1: Push Code to GitHub

Open **PowerShell** or **Git Bash** in your portfolio directory:
```powershell
cd "c:\Users\yuvar\OneDrive\Desktop\gen ai and agentic ai\portfolio"
```

### Option A: If this is a new repository
1. Go to [github.com/new](https://github.com/new) and create a repository named `portfolio` (or `ai-portfolio`). Keep it **Public**.
2. Run these commands in your project folder:
```powershell
# 1. Initialize git if not already initialized
git init

# 2. Stage all files
git add .

# 3. Commit the changes
git commit -m "feat: complete portfolio with admin portal, dynamic resume updater, and email delivery"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/vamshiyadav-06/portfolio.git

# 6. Push to GitHub
git push -u origin main
```

### Option B: If the repository already exists
```powershell
git add .
git commit -m "feat: add admin portal, resume updater, and email integration"
git push origin main
```

---

## 4. Step 2: Deploy to Vercel (1-Click Import)

1. Open [vercel.com/dashboard](https://vercel.com/dashboard) and log in with your GitHub account.
2. Click the **"Add New..."** button (top right) and choose **"Project"**.
3. Under **"Import Git Repository"**, locate your `portfolio` repository and click **"Import"**.
4. Configure the Project Settings:
   - **Project Name**: `vamshi-portfolio` (or whatever you prefer)
   - **Framework Preset**: Select **"Other"** (Vercel automatically detects static HTML/CSS/JS)
   - **Root Directory**: Leave as `./`
   - **Build and Output Settings**: Leave empty / default (no compilation command needed).
5. Click **"Deploy"**.
6. Within 15–20 seconds, Vercel will complete the deployment and provide your live URL (e.g. `https://vamshi-portfolio.vercel.app`).

---

## 5. Step 3: Setup Free Email Delivery to Your Inbox
Whenever a visitor enters their name, email, and message on your contact form, you will receive the details straight in `vamshiyadav1905@gmail.com`.

### 1-Minute Setup:
1. Open [web3forms.com](https://web3forms.com) in your browser.
2. In the box, type your email: `vamshiyadav1905@gmail.com` and click **"Create Access Key"**.
3. Check your Gmail inbox for an email from Web3Forms containing your **Access Key** (e.g. `a1b2c3d4-e5f6-7890-abcd-1234567890ab`).
4. Open your live website (or `http://localhost:3456`).
5. Click **Admin** in the top navigation bar (or press `Ctrl + Shift + A`).
6. Log in with:
   - **Username**: `admin`
   - **Password**: `admin`
7. Click the **"Email Service"** tab.
8. Paste your Access Key into the field and click **"Save Email Key"**.

✅ **Done!** From now on, any message sent through your contact form arrives directly in your Gmail inbox in real-time.

---

## 6. Step 4: Using the Admin Portal

### Accessing the Portal
You can open the Admin Portal in 3 ways:
1. Click the **"Admin"** button in the top navigation bar.
2. Click **"Admin Portal"** at the bottom of the website footer.
3. Press the keyboard shortcut: **`Ctrl + Shift + A`** (or **`Alt + A`**).
4. Or open the Command Palette (**`Ctrl + K`**), type `admin`, and press Enter.

### Default Credentials
- **Username**: `admin`
- **Default Password**: `admin`

---

### Updating the Resume Link
1. Log in to the Admin Portal.
2. In the **"Resume Link"** tab, enter your new resume URL (Google Drive, Dropbox, Notion, or personal PDF):
   ```text
   https://drive.google.com/file/d/your-new-resume-id/view?usp=sharing
   ```
3. Click **"Update Live Resume Link"**.
4. **Immediate Effect**:
   - The Hero "Download Resume" button, Navbar "Resume (PDF)", Contact "Resume" card, and Command Palette are all updated instantly.
   - The updated link is saved in your browser's persistent storage.
5. **Making it Permanent for All Future Visitors**:
   - Click the **"Copy Snippet"** button in the Admin tab.
   - Open [js/config.js](file:///c:/Users/yuvar/OneDrive/Desktop/gen%20ai%20and%20agentic%20ai/portfolio/js/config.js#L15) and paste the line:
     ```javascript
     resumeUrl: "https://drive.google.com/file/d/your-new-resume-id/view?usp=sharing",
     ```
   - Commit & push (`git commit -am "update resume" && git push`). Vercel will redeploy in 10 seconds!

---

### Changing the Admin Password
1. In the Admin Portal, click the **"Change Password"** tab.
2. Enter your **Current Password** (default is `admin`).
3. Enter your **New Password** (minimum 5 characters).
4. Re-enter the new password in **Confirm New Password**.
5. Click **"Update Password"**.
6. The new password is cryptographically hashed with **SHA-256** and saved securely in your browser's local storage.

---

## 7. Step 5: Adding a Custom Domain (Optional)
If you own a custom domain (such as `vamshibudida.dev` or `vamshi.ai`):

1. Go to your project on [vercel.com](https://vercel.com).
2. Go to **Settings** → **Domains**.
3. Type your domain name (e.g. `vamshibudida.dev`) and click **"Add"**.
4. Vercel will display the recommended DNS records:
   - **Type A**: `76.76.21.21` (for apex domain `@`)
   - **CNAME**: `cname.vercel-dns.com` (for `www`)
5. Log into your domain registrar (GoDaddy, Namecheap, Google Domains / Squarespace, Cloudflare) and add the DNS records.
6. Vercel automatically generates and renews a free **SSL certificate (HTTPS)** for your domain.

---

## 8. Step 6: Continuous Deployment (Auto-Redeploy on Push)
Vercel is directly connected to your GitHub repository:
- Whenever you make changes locally:
  ```powershell
  git add .
  git commit -m "Update projects or resume"
  git push origin main
  ```
- Vercel automatically detects the push and deploys the new version within seconds.
- You can monitor deployments under the **"Deployments"** tab in your Vercel Dashboard.

---

## 9. Troubleshooting & FAQs

### Q: Does the contact form work without backend servers?
**Yes.** The contact form connects directly to the Web3Forms HTTPS API from the visitor's browser. It works 100% reliably on static Vercel hosting with zero server maintenance. If no key is set or the user is offline, it cleanly offers a pre-filled direct mail link as a backup.

### Q: Why do I see a 404 error on Vercel?
Ensure `index.html` is in the **root** folder of your GitHub repository (not nested inside an extra subfolder like `portfolio/portfolio`). In Vercel Project Settings, the **Root Directory** should be `./`.

### Q: How do I test the site locally before pushing?
Run any local static server:
```powershell
# Using Python
python -m http.server 3456

# Using Node.js (npx)
npx serve .
```
Visit `http://localhost:3456`.

---
*Created for Vamshi Budida — AI Engineer | Python Developer*
