function doGet(e) {
  var action = e.parameter.action;
  if (action === 'list') return listGifts();
  return json({error: 'unknown action'});
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.action === 'claim')   return claimGift(data.id, data.name);
  if (data.action === 'unclaim') return unclaimGift(data.id);
  if (data.action === 'add')     return addGift(data.name, data.description, data.link, data.image);
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
    id:          row[0],
    name:        row[1],
    description: row[2],
    link:        row[3],
    status:      row[4],
    claimed_by:  row[5],
    image:       row[6]
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

function addGift(name, description, link, image) {
  var sheet = getSheet();
  var newId = Date.now();
  sheet.appendRow([newId, name, description || '', link || '', 'available', '', image || '']);
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
