# Codeforces Problem Finder

A modern web application to find unsolved Codeforces problems for group practice. Perfect for competitive programming teams and study groups!

## Features

- 🎯 **Smart Problem Discovery**: Find problems unsolved by all members of your group
- 📊 **Rating-based Sorting**: Problems sorted by rating, then by popularity (solve count)
- 🏷️ **Advanced Filtering**: Filter by rating range, tags, and search queries
- 💾 **Group Management**: Save and load groups in your browser (no database needed)
- 📥 **Multiple Export Formats**: Export to Vjudge, CSV, or JSON
- 🌙 **Dark Mode**: Easy on the eyes with beautiful dark theme
- 📱 **Responsive Design**: Works great on mobile, tablet, and desktop

## File Structure

```
codeforces-problem-finder/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Base styles and layout
│   ├── components.css     # Component-specific styles
│   └── theme.css          # Rating colors and themes
├── js/
│   ├── app.js             # Main application logic
│   ├── api.js             # Codeforces API integration
│   ├── storage.js         # Browser storage management
│   ├── ui.js              # UI rendering and interactions
│   └── exporter.js        # Export functionality
└── README.md              # This file
```

## How to Use

1. **Enter Handles**: Type Codeforces handles (one per line) in the input box
2. **Find Problems**: Click "Find Problems" to fetch unsolved problems
3. **Filter (Optional)**: Use filters to narrow down results by rating, tags, or search
4. **Select Problems**: Click on problems to select them, or use "Select All"
5. **Export**: Click "Export" and choose your format (Vjudge, CSV, or JSON)

### Save & Load Groups

- Click **"Save Group"** to save your current handles for later use
- Click **"Load Group"** to quickly load previously saved groups
- All groups are stored in your browser's localStorage

## Deploying to Netlify

### Method 1: Drag & Drop (Easiest)

1. Create a folder with all the files maintaining the structure above
2. Go to [Netlify](https://app.netlify.com)
3. Drag the entire folder onto the Netlify dashboard
4. Your site will be live in seconds!

### Method 2: GitHub Integration

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to [Netlify](https://app.netlify.com)
4. Click "New site from Git"
5. Connect to your GitHub repository
6. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: (leave empty or set to `/`)
7. Click "Deploy site"

### Method 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to your project folder
cd codeforces-problem-finder

# Deploy
netlify deploy --prod
```

## Export Formats

### Vjudge Format
Tab-separated format ready to paste into Vjudge:
```
CodeForces	|	1A	|	1	|	
CodeForces	|	1B	|	1	|	
```

### CSV Format
Spreadsheet-compatible format with full problem details:
```csv
Contest ID,Index,Name,Rating,Solved Count,Tags,URL
1,A,"Theatre Square",1000,50000,"math, greedy",https://...
```

### JSON Format
Structured data for programmatic use:
```json
[
  {
    "contestId": 1,
    "index": "A",
    "name": "Theatre Square",
    "rating": 1000,
    "solvedCount": 50000,
    "tags": ["math", "greedy"],
    "url": "https://..."
  }
]
```

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires a modern browser with ES6 module support.

## Technical Details

### API Usage
- Uses the official Codeforces API
- No API key required
- Respects rate limits
- Caches results to minimize API calls

### Data Storage
- Groups stored in browser localStorage
- No backend required
- No external database needed
- Data persists until cleared manually

### Performance
- Efficient client-side filtering
- Lazy loading of problem groups
- Optimized for handling 1000+ problems

## Tips for Best Results

1. **Handle Validation**: Make sure all handles are correct to avoid API errors
2. **Group Size**: Works best with 2-10 handles (more handles = longer fetch time)
3. **Filter Early**: Use rating filters to focus on relevant problems
4. **Save Groups**: Save frequently used groups for quick access
5. **Export Selection**: Select specific problems before exporting for custom problem sets

## Troubleshooting

**Problem: "Error fetching problems"**
- Check that all Codeforces handles are spelled correctly
- Verify the handles exist on Codeforces
- Try again after a few seconds (API rate limiting)

**Problem: No problems showing**
- Adjust filter settings (reset to defaults)
- Check if the group has actually solved all problems in the rating range
- Try a different handle combination

**Problem: Export not working**
- Check browser pop-up settings
- Ensure JavaScript is enabled
- Try a different browser

## Credits

- Data from [Codeforces API](https://codeforces.com/apiHelp)
- Built with vanilla JavaScript (no frameworks!)
- Icons from Unicode emoji

## License

Free to use for personal and educational purposes.

---

Made with ❤️ for competitive programmers
