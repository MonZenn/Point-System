# Study Point System - PWA

A Progressive Web App (PWA) that gamifies studying by tracking study time and converting it into points. Users can swap points for leisure time, creating a balanced study-reward system.

## Features

- **User Authentication**: Register and login with Google Sheets as database
- **Study Timer**: Track study time and earn 100 points per 5 minutes
- **Point System**: Accumulate points from studying
- **Shop**: Swap points for leisure time (2 points = 1 minute)
- **Achievement Bonus**: Add 500 points for achievements
- **Leisure Timer**: Use accumulated leisure time
- **PWA Support**: Install on mobile/desktop and work offline
- **Editable Username**: Change your display name anytime

## Setup Instructions

### 1. Google Sheets Setup

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "Study Point System Database" (or any name you prefer)
3. The sheet will be automatically created by the script when the first user registers

### 2. Google Apps Script Setup

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor
3. Copy all the code from `gas-backend.gs` file and paste it into the Apps Script editor
4. Click **Save** (disk icon) and name the project "Study Point Backend"
5. Click **Deploy > New deployment**
6. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
7. Configure the deployment:
   - **Description**: Study Point System API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
8. Click **Deploy**
9. Click **Authorize access** and allow the necessary permissions
10. **Copy the Web app URL** - you'll need this for the next step

### 3. Configure the Web App

1. Open the `app.js` file in this project
2. Find the line at the top:
   ```javascript
   const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` with the Web app URL you copied (keep the quotes)
4. Save the file

### 4. Create PWA Icons (Optional but Recommended)

Create two icon files for the PWA:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

You can create simple icons using online tools like:
- [Canva](https://www.canva.com)
- [Figma](https://www.figma.com)
- [Photopea](https://www.photopea.com)

Place these icon files in the same folder as your HTML file.

**Quick Icon Option**: If you don't want to create icons right now, you can use a simple colored square or download free icons from [Flaticon](https://www.flaticon.com).

### 5. Deploy the Web App

#### Option A: GitHub Pages (Free Hosting)

1. Create a new GitHub repository
2. Upload all project files to the repository
3. Go to repository Settings > Pages
4. Select the main branch as source
5. Your app will be available at: `https://yourusername.github.io/repository-name/`

#### Option B: Local Testing

1. Install a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```
2. Open your browser and go to `http://localhost:8000`

#### Option C: Netlify (Free Hosting)

1. Go to [Netlify](https://www.netlify.com)
2. Drag and drop your project folder
3. Your app will be live instantly with a URL like `https://random-name.netlify.app`

### 6. Install as PWA

Once deployed:

**On Mobile (Android):**
1. Open the website in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. Confirm the installation

**On Desktop (Chrome):**
1. Open the website in Chrome
2. Click the install icon (➕) in the address bar
3. Click "Install"

**On iOS (Safari):**
1. Open the website in Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. Confirm

## Usage Guide

### Registration & Login

1. Open the app
2. Click "Register" to create a new account
3. Enter a username and password (stored in Google Sheets)
4. Login with your credentials

**Default Starting Points**: 1,000,000 points (as shown in your screenshot)

### Home Tab - Study Timer

1. Click the **Play button** to start studying
2. Timer counts upward
3. Shows "pts gained" based on elapsed time
4. Click **Play button** again to pause
5. Click **Power button** to stop and save:
   - Calculates total points earned (100 pts per 5 mins)
   - Adds points to your total
   - Resets the timer

### Shop Tab

**Swap Points for Leisure Time:**
1. Enter the number of points to swap
2. See the conversion (2 points = 1 minute)
3. Click "Swap Points"
4. Leisure time is added to your account

**Achievement Bonus:**
- Click "Add 500 Points" to add bonus points
- Use this for completing achievements or milestones

### Leisure Tab

1. View your total accumulated leisure time
2. Click "Start Leisure" to begin countdown
3. Timer counts downward
4. Click "Stop Leisure" to pause
5. Used time is deducted from your total

### Username Editing

- Click the pencil icon ✏️ next to your username
- Enter a new username
- Changes are saved to Google Sheets

## How It Works

### Point Calculation
- Study for 5 minutes = 100 points
- Study for 10 minutes = 200 points
- And so on...

### Leisure Time Conversion
- 2 points = 1 minute of leisure time
- 100 points = 50 minutes
- 1000 points = 500 minutes (8.33 hours)

## File Structure

```
Point System/
├── index.html          # Main HTML file with all screens
├── styles.css          # Styling (dark theme UI)
├── app.js              # JavaScript logic
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── gas-backend.gs      # Google Apps Script backend
├── icon-192.png        # PWA icon (192x192)
├── icon-512.png        # PWA icon (512x512)
└── README.md           # This file
```

## Troubleshooting

### Login/Register not working?
- Check if you've updated the `APPS_SCRIPT_URL` in `app.js`
- Verify the Google Apps Script deployment is set to "Anyone" access
- Check browser console for error messages

### PWA not installing?
- Make sure you're using HTTPS (required for PWA)
- Verify `manifest.json` is properly linked
- Check that icon files exist

### Timer not working?
- Clear browser cache and reload
- Check browser console for JavaScript errors

### Data not saving?
- Verify Google Sheets permissions
- Check Apps Script execution permissions
- Ensure stable internet connection

## Updating the Apps Script

If you make changes to `gas-backend.gs`:

1. Copy the updated code
2. Paste into Apps Script editor
3. Click **Save**
4. Go to **Deploy > Manage deployments**
5. Click the edit icon (pencil) on your deployment
6. Select **New version**
7. Click **Deploy**

**Note**: The Web app URL remains the same, so you don't need to update `app.js` again.

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (Chrome, Safari, Samsung Internet)

## Security Notes

- Passwords are stored in plain text in Google Sheets (as per your requirement)
- For production use, consider implementing password hashing
- Keep your Google Apps Script URL private
- Regularly backup your Google Sheet

## Credits

Created for study time management and gamification. Feel free to customize and improve!

## License

Free to use and modify for personal and educational purposes.
