# Firebase Setup Guide for Image Upload

This guide will help you set up Firebase Storage for noun image uploads.

## Prerequisites
- A Google account
- Firebase project (or create a new one)

## Step 1: Create/Access Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if not needed)

## Step 2: Enable Firebase Storage

1. In Firebase Console, click on "Build" in the left sidebar
2. Click on "Storage"
3. Click "Get Started"
4. Choose "Start in production mode" (you can modify rules later)
5. Select a Cloud Storage location close to your users
6. Click "Done"

## Step 3: Configure Storage Security Rules

1. In Firebase Storage, go to the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload images to the nouns folder
    match /nouns/{allPaths=**} {
      allow read: if true;  // Anyone can read images
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

3. Click "Publish"

**Note:** The current implementation uploads from the client using Firebase SDK. If you want additional security, you can modify the rules or implement server-side uploads only.

## Step 4: Get Firebase Configuration (Client-Side)

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>)  to add a web app
4. Register your app with a nickname (e.g., "Double App Client")
5. Copy the Firebase configuration object
6. Create a `.env` file in the `client` folder with these values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Get Service Account Key (Server-Side)

1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded JSON file securely (DO NOT commit to git!)
4. Create a `.env` file in the `server` folder
5. Copy the entire JSON content and add it as a single line:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

**Important:** Make sure to escape the private key properly or use the entire JSON as a single-line string.

## Step 6: Update Your .gitignore

Make sure these files are in your `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local

# Firebase
*-firebase-adminsdk-*.json
firebase-debug.log
.firebase/
```

## Step 7: Test the Setup

1. Start your server: `cd server && npm run dev`
2. Start your client: `cd client && npm run dev`
3. Log in to your app
4. Go to Data Management > Nouns
5. Try adding or editing a noun and upload an image
6. Check Firebase Console > Storage to see if the image was uploaded

## Troubleshooting

### "Firebase initialization error"
- Check that your `FIREBASE_SERVICE_ACCOUNT` is properly formatted JSON
- Verify that the service account has the correct permissions

### "Failed to upload image"
- Check browser console for detailed error messages
- Verify Firebase Storage rules allow uploads
- Check that all client `.env` variables are prefixed with `VITE_`
- Ensure file size is under 5MB and is a valid image format

### Images not displaying
- Check that the Storage rules allow read access
- Verify the imageUrl is being saved to the database
- Check browser console for CORS or network errors

## Security Best Practices

1. **Never commit** Firebase credentials or service account keys to version control
2. Use different Firebase projects for development and production
3. Implement proper authentication before allowing uploads
4. Consider implementing file size limits and virus scanning for production
5. Review and restrict Storage security rules based on your needs
6. Use Firebase Authentication to add user-based access control
7. Regularly audit your Firebase usage and security rules

## Additional Features You Can Add

- **Server-side upload validation**: Move upload logic to server for better security
- **Image optimization**: Compress images before upload using libraries like `sharp`
- **CDN**: Use Firebase CDN for faster image delivery
- **Image moderation**: Integrate Cloud Vision API to check uploaded images
- **Signed URLs**: Use temporary signed URLs for sensitive images
- **Watermarking**: Add watermarks to uploaded images

## Costs

Firebase Storage pricing (as of 2024):
- Storage: $0.026 per GB/month
- Download: $0.12 per GB
- Upload: Free

The free tier includes:
- 5 GB storage
- 1 GB/day download
- 20,000 uploads per day

For most small to medium applications, the free tier should be sufficient.
