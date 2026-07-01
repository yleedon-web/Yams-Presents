# Phase 2: Google Apps Script Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a Google Sheet as the gift database and deploy a Google Apps Script web app as a free serverless API for reading and writing gifts.

**Architecture:** A single Google Sheet named "Gifts" holds all gift data. A Google Apps Script deployed as a public web app acts as a REST API — `doGet` handles list requests, `doPost` handles mutations. The script runs on Google's servers, no infrastructure to maintain. A reference copy of the script lives at `scripts/Code.gs` in the repo.

**Tech Stack:** Google Sheets, Google Apps Script (JavaScript), curl (for testing)

## Global Constraints

- The sheet tab must be named exactly `Gifts` (Apps Script references it by name)
- Sheet columns must be in this exact order: `id | name | description | link | status | claimed_by`
- Row 1 is the header row — data starts at row 2
- `status` values are exactly `"available"` or `"taken"` (lowercase)
- Gift IDs are timestamps (`Date.now()`) — unique, never reused after deletion
- Apps Script deployed with: Execute as **Me**, Who has access **Anyone**
- The deployed web app URL is needed for Phase 3 — record it after deployment

---

## File Map

| File | Purpose |
|------|---------|
| `scripts/Code.gs` | Reference copy of the Apps Script — paste this into Google |

---

### Task 1: Create Google Sheet and commit Code.gs reference

**Files:**
- Create: `scripts/Code.gs`

**Interfaces:**
- Produces: `scripts/Code.gs` — the complete Apps Script to paste into Google

- [ ] **Step 1: Create `scripts/Code.gs`**

Create the file with this exact content:

```javascript
function doGet(e) {
  var action = e.parameter.action;
  if (action === 'list') return listGifts();
  return json({error: 'unknown action'});
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.action === 'claim')   return claimGift(data.id, data.name);
  if (data.action === 'unclaim') return unclaimGift(data.id);
  if (data.action === 'add')     return addGift(data.name, data.description, data.link);
  if (data.action === 'delete')  return deleteGift(data.id);
  return json({error: 'unknown action'});
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Gifts');
}

function rowToGift(row) {
  return {
    id:         row[0],
    name:       row[1],
    description:row[2],
    link:       row[3],
    status:     row[4],
    claimed_by: row[5]
  };
}

function listGifts() {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  var gifts = [];
  for (var i = 1; i < rows.length; i++) {
    gifts.push(rowToGift(rows[i]));
  }
  return json(gifts);
}

function claimGift(id, name) {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 5).setValue('taken');
      sheet.getRange(i + 1, 6).setValue(name);
      return json({success: true});
    }
  }
  return json({error: 'gift not found'});
}

function unclaimGift(id) {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 5).setValue('available');
      sheet.getRange(i + 1, 6).setValue('');
      return json({success: true});
    }
  }
  return json({error: 'gift not found'});
}

function addGift(name, description, link) {
  var sheet = getSheet();
  var newId = Date.now();
  sheet.appendRow([newId, name, description || '', link || '', 'available', '']);
  return json({success: true, id: newId});
}

function deleteGift(id) {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return json({success: true});
    }
  }
  return json({error: 'gift not found'});
}
```

- [ ] **Step 2: Create the Google Sheet (manual)**

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Rename it **"Yam's Presents"**
3. Rename the default sheet tab (bottom) from "Sheet1" to **"Gifts"** (right-click the tab → Rename)
4. Add these headers in row 1, one per column: `id`, `name`, `description`, `link`, `status`, `claimed_by`
5. Leave row 2 empty — gifts will be added via the API in Task 3

- [ ] **Step 3: Commit Code.gs to repo**

```bash
git add scripts/Code.gs
git commit -m "feat: add Google Apps Script backend reference"
```

---

### Task 2: Deploy Google Apps Script

**Files:** None (Google-side only)

**Interfaces:**
- Produces: a deployed web app URL of the form `https://script.google.com/macros/s/<ID>/exec` — record this for Phase 3

- [ ] **Step 1: Open Apps Script editor**

In your Google Sheet: **Extensions → Apps Script**. This opens the script editor bound to the sheet.

- [ ] **Step 2: Paste the script**

Delete all existing code in the editor (it has a default `myFunction`). Paste the entire contents of `scripts/Code.gs`.

- [ ] **Step 3: Save the script**

Press `Cmd+S` (or click the save icon). Name the project **"Yams Presents API"** when prompted.

- [ ] **Step 4: Deploy as web app**

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set description: `v1`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Authorize when prompted (click "Authorize access" → choose your Google account → "Allow")
8. **Copy the web app URL** — it looks like `https://script.google.com/macros/s/AKfycb.../exec`
9. Save this URL somewhere — it's needed for Phase 3

---

### Task 3: Test all API endpoints

**Files:** None

**Interfaces:**
- Consumes: the web app URL from Task 2
- Verifies: all 5 API actions work correctly before Phase 3 frontend connects to them

Replace `YOUR_URL` with your deployed web app URL in each command below.

- [ ] **Step 1: Test list (GET)**

```bash
curl "YOUR_URL?action=list"
```

Expected: `[]` (empty array — no gifts yet)

- [ ] **Step 2: Test add (POST)**

```bash
curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"add","name":"LEGO Set","description":"Technic 42, age 7+","link":"https://amazon.com"}'
```

Expected: `{"success":true,"id":<timestamp>}` — note the `id` value returned.

- [ ] **Step 3: Test list again**

```bash
curl "YOUR_URL?action=list"
```

Expected: JSON array with one gift, `status: "available"`, `claimed_by: ""`

- [ ] **Step 4: Test claim (POST)**

Use the `id` from Step 2:

```bash
curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"claim","id":<id-from-step-2>,"name":"Aunt Sara"}'
```

Expected: `{"success":true}`

- [ ] **Step 5: Verify claim in sheet**

Open the Google Sheet — the LEGO Set row should now show `taken` in column E and `Aunt Sara` in column F.

- [ ] **Step 6: Test unclaim (POST)**

```bash
curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"unclaim","id":<id-from-step-2>}'
```

Expected: `{"success":true}`. Sheet should revert to `available` with empty `claimed_by`.

- [ ] **Step 7: Test delete (POST)**

```bash
curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"delete","id":<id-from-step-2>}'
```

Expected: `{"success":true}`. Sheet row should be gone.

- [ ] **Step 8: Final list check**

```bash
curl "YOUR_URL?action=list"
```

Expected: `[]` — back to empty.

- [ ] **Step 9: Add a few real gifts for Yam**

Use the `add` action to add real gifts. Example:

```bash
curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"add","name":"Bike Helmet","description":"Red, size S","link":""}'
```

Run this once per gift. Each gets a unique ID assigned by the API.

- [ ] **Step 10: Record the URL**

Create `scripts/APPS_SCRIPT_URL.txt` with just the URL (this file is gitignored — it's a local reference only):

```bash
echo "YOUR_URL" > scripts/APPS_SCRIPT_URL.txt
echo "scripts/APPS_SCRIPT_URL.txt" >> .gitignore
git add .gitignore
git commit -m "chore: gitignore apps script url file"
```
