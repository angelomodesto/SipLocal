# Deployment Guide for SipLocal

This guide will help you deploy your SipLocal app to production using Vercel and connect your custom domain `siplocal.site`.

## Prerequisites

- GitHub account (your code should be pushed to GitHub)
- Vercel account (free tier available)
- Namecheap domain: `siplocal.site`
- Supabase project with credentials

## Step 1: Prepare Your Code

1. **Ensure all changes are committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin feature/pin-board  # or your main branch
   ```

2. **Verify your build works locally:**
   ```bash
   npm run build
   ```
   If this fails, fix any errors before deploying.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (easiest)

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository: `angelomodesto/SipLocal`
   - Select the branch: `feature/pin-board` (or your main branch)

3. **Configure Project Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   ⚠️ **Important:** Get these from your Supabase dashboard → Settings → API

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)
   - You'll get a URL like: `siplocal-xyz.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Add Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## Step 3: Connect Your Custom Domain

### In Vercel Dashboard:

1. **Go to Your Project:**
   - Click on your project in Vercel dashboard
   - Go to "Settings" → "Domains"

2. **Add Domain:**
   - Enter: `siplocal.site`
   - Click "Add"
   - Also add: `www.siplocal.site` (optional, for www version)

3. **Get DNS Configuration:**
   - Vercel will show you DNS records to add
   - You'll see something like:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

### In Namecheap Dashboard:

1. **Login to Namecheap:**
   - Go to [namecheap.com](https://namecheap.com)
   - Login to your account

2. **Go to Domain List:**
   - Click "Domain List" from the left menu
   - Find `siplocal.site`
   - Click "Manage"

3. **Configure DNS:**
   - Go to "Advanced DNS" tab
   - Remove any existing A records for `@`
   - Add the DNS records from Vercel:

   **For Root Domain (siplocal.site):**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21 (or the IP Vercel provides)
   TTL: Automatic
   ```

   **For WWW (www.siplocal.site):**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com (or the CNAME Vercel provides)
   TTL: Automatic
   ```

4. **Save Changes:**
   - Click the checkmark to save each record
   - DNS propagation can take 24-48 hours, but usually works within 1-2 hours

## Step 4: Verify Deployment

1. **Check Vercel Status:**
   - Go to your Vercel project dashboard
   - Check that the domain shows "Valid Configuration"
   - Wait for SSL certificate to be issued (automatic, takes a few minutes)

2. **Test Your Site:**
   - Visit `http://siplocal.site` (may take time for DNS to propagate)
   - Visit `https://siplocal.site` (once SSL is active)
   - Test all functionality (search, filters, business pages, auth)

3. **Check Environment Variables:**
   - Ensure all Supabase connections work
   - Test authentication (sign up/login)
   - Verify database queries work

## Step 5: Set Up Automatic Deployments (Optional but Recommended)

Vercel automatically deploys when you push to your connected branch:

1. **Default Branch:**
   - Go to Settings → Git
   - Set your production branch (e.g., `main` or `feature/pin-board`)

2. **Preview Deployments:**
   - Every push to other branches creates preview deployments
   - Useful for testing before merging

## Troubleshooting

### DNS Not Working?
- Wait 24-48 hours for full propagation
- Use [whatsmydns.net](https://www.whatsmydns.net) to check DNS propagation
- Verify records in Namecheap match Vercel exactly

### Build Fails?
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Test build locally: `npm run build`

### Environment Variables Not Working?
- Make sure variables are added in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### SSL Certificate Issues?
- Vercel automatically provisions SSL via Let's Encrypt
- Wait 5-10 minutes after domain is verified
- Check Vercel dashboard for SSL status

## Alternative Deployment Options

### Netlify
- Similar to Vercel
- Good for Next.js apps
- Free tier available
- [netlify.com](https://netlify.com)

### Railway
- Good for full-stack apps
- Easy database integration
- [railway.app](https://railway.app)

### Self-Hosting
- Requires VPS (DigitalOcean, AWS, etc.)
- More complex setup
- Full control but more maintenance

## Next Steps

After deployment:
1. ✅ Test all features work in production
2. ✅ Set up monitoring (Vercel Analytics)
3. ✅ Configure error tracking (Sentry, etc.)
4. ✅ Set up backups for Supabase database
5. ✅ Consider adding a CDN for images
6. ✅ Set up staging environment for testing

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Namecheap DNS Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-do-i-set-up-an-a-address-record-for-my-domain/)
- [Supabase Documentation](https://supabase.com/docs)


