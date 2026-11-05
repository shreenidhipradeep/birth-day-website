# 🎂 Birthday Surprise Website for Yahya (Made by his sister, Shree)

A cinematic, interactive 7-page birthday journey designed with rich animations, glowing glassmorphism cards, continuous background music, and a randomized memory vault.

---

## 🚀 How to Run Locally

You have multiple quick ways to view and test the website:

### Option 1: Direct Double-Click (Easiest)
1. Navigate to this folder on your computer.
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, Brave, or Safari.
3. Tap the gift box to begin the surprise journey and start the Remo background song!

### Option 2: VS Code Live Server
1. Open this folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option 3: Python Local Server
Run this command in PowerShell or Terminal inside this folder:
```powershell
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 🎁 The 7-Step Surprise Journey

| Page | Step Name | Features |
|---|---|---|
| **`index.html`** | **1. The Gift Box** | Glowing dark screen with a 3D wrapped gift box. Tapping it pops the lid, bursts confetti, unlocks audio autoplay restrictions, and starts the Remo song. |
| **`countdown.html`** | **2. Get Ready** | High-energy 5-4-3-2-1 countdown with firework bursts on each beat and motivational teaser messages, auto-redirecting to the wish. |
| **`wish.html`** | **3. Happy Birthday** | Shimmering gradient typography "Happy Birthday Yahya! 🎉", colorful floating balloons, and continuous celebratory confetti shower. |
| **`memories.html`** | **4. Our Memories** | **Fisher-Yates Random Shuffle**: The 12 photos are never in numerical order and shuffle randomly every single visit. Features realistic Polaroid frames with randomized tilts, randomized captions, tap-to-zoom Lightbox (with touch swipe & keyboard arrows), plus a toggleable 3D Slideshow mode. |
| **`letter.html`** | **5. A Letter For You** | Realistic 3D envelope with a golden wax seal. Tapping the seal opens the envelope and unfolds a heartfelt handwritten letter in Dancing Script font. |
| **`cake.html`** | **6. Make a Wish** | Interactive 3-tier birthday cake with glowing candles. Tap "Light the candles 🔥", then "Blow them out 💨🎂" to extinguish flames with smoke trails, trigger a massive confetti blast, and reveal a "Make a Wish" card. (You can also tap the cake directly!). |
| **`final.html`** | **7. One Last Surprise** | Grand fireworks finale canvas with Chrysanthemum rocket bursts, touching sister-brother message, and a **"Replay 🔁"** button that resets music to the beginning. |

---

## 🎵 Music Continuity Across Pages

- Browsers typically block music from starting without a user gesture. On `index.html`, tapping the gift box provides this gesture and starts the song.
- When navigating from page to page, the website automatically stores the exact playback timestamp (`audio.currentTime`) in `sessionStorage`.
- Every page resumes playback right from where it left off without restarting from the beginning.
- A floating **Spinning Vinyl Widget** is present on every page. Clicking it toggles play/pause with musical note particles radiating into the air (clean icon design with no intrusive text).
- The song plays continuously across all pages, and automatically loops/replays only after it has completely finished playing through!

---

## ⚙️ How to Customize (Top of `script.js`)

All settings are neatly organized in the `CONFIG` object at lines 10–55 of `script.js`:

```javascript
const CONFIG = {
  friendName: "Yahya",             // Change friend's name here
  myName: "Shree",                 // Change your name here
  
  assetFolder: "birthday/",        // Folder containing photos and song
  imagePrefix: "image",           // File prefix (image1, image2, etc.)
  imageExtension: ".jpeg",        // Change to .jpg or .png if you replace photos
  totalImages: 12,                // Number of photos
  songFile: "birthday/song.mp3",  // Path to background song
  
  captions: [                     // Random captions for Polaroid photos
    "Good times 😄",
    "Never forget this day 💛",
    "Pure chaos 🤪",
    "My brother, my friend ❤️",
    ...
  ],

  letterGreeting: "Dear Yahya,",
  letterBody: [                   // Custom paragraphs for the letter
    "Happy Birthday to someone who has always been more than just a best friend — having you as a brother is such a blessing.",
    ...
  ],
  letterClosing: "Forever your sister,<br>– Shree ❤️"
};
```

---

## 🌐 How to Share with Yahya

### 1. Free 1-Click Hosting on Netlify Drop (Recommended & Fastest!)
1. Open your browser and go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this entire folder (`birthday`) onto the Netlify Drop box.
3. In 10 seconds, Netlify will give you a public URL (e.g. `https://yahya-birthday-surprise.netlify.app`).
4. Copy the link and text it to Yahya on WhatsApp or Instagram!

### 2. GitHub Pages (Free Permanent Hosting)
1. Create a GitHub repository (e.g. `yahya-birthday`).
2. Upload all files (`index.html`, `script.js`, `style.css`, and the `birthday/` folder).
3. Go to **Settings > Pages > Branch: main > Save**.
4. Your website will be live at `https://your-username.github.io/yahya-birthday/`.

### 3. ZIP File Direct Send
1. Right-click this folder > **Compress to ZIP file**.
2. Send `birthday.zip` to Yahya via Google Drive, Telegram, or WhatsApp.
3. He just extracts it and opens `index.html`!

