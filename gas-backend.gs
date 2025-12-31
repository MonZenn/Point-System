// Google Apps Script Backend for Study Point System
// This script should be attached to your Google Sheets document

// Sheet name
const SHEET_NAME = 'Users';

// doGet - Handle GET requests
function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case 'getUserData':
      return getUserData(e.parameter.username);
    case 'register':
      return register(e.parameter.username, e.parameter.password);
    case 'login':
      return login(e.parameter.username, e.parameter.password);
    case 'updateUserData':
      return updateUserData(e.parameter.username, 
                           parseInt(e.parameter.points) || 0, 
                           parseInt(e.parameter.leisureSeconds) || 0);
    case 'updateUsername':
      return updateUsername(e.parameter.oldUsername, e.parameter.newUsername);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid request'
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

// doPost - Handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'register':
        return register(data.username, data.password);
      case 'login':
        return login(data.username, data.password);
      case 'updateUserData':
        return updateUserData(data.username, data.points, data.leisureMinutes);
      case 'updateUsername':
        return updateUsername(data.oldUsername, data.newUsername);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, 'Error processing request: ' + error.message);
  }
}

// Get spreadsheet and sheet
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Username', 'Password', 'Points', 'Leisure Seconds', 'Created Date', 'Last Updated']);
  }
  
  return sheet;
}

// Register new user
function register(username, password) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Convert to strings and trim
  const newUsername = String(username).trim();
  const newPassword = String(password).trim();
  
  // Check if username already exists
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === newUsername.toLowerCase()) {
      return createResponse(false, 'Username already exists');
    }
  }
  
  // Add new user
  const timestamp = new Date();
  sheet.appendRow([newUsername, newPassword, 500, 0, timestamp, timestamp]);
  
  return createResponse(true, 'Registration successful');
}

// Login user
function login(username, password) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Convert inputs to strings and trim
  const inputUsername = String(username).trim();
  const inputPassword = String(password).trim();
  
  // Find user
  for (let i = 1; i < data.length; i++) {
    const storedUsername = String(data[i][0]).trim();
    const storedPassword = String(data[i][1]).trim();
    
    if (storedUsername === inputUsername && storedPassword === inputPassword) {
      return createResponse(true, 'Login successful', {
        username: data[i][0],
        points: Number(data[i][2]) || 0,
        leisureMinutes: Math.floor(Number(data[i][3]) / 60) || 0,
        leisureSeconds: Number(data[i][3]) || 0
      });
    }
  }
  
  return createResponse(false, 'Invalid username or password');
}

// Get user data
function getUserData(username) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find user
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      return createResponse(true, 'User data retrieved', {
        username: data[i][0],
        points: Number(data[i][2]) || 0,
        leisureMinutes: Math.floor(Number(data[i][3]) / 60) || 0,
        leisureSeconds: Number(data[i][3]) || 0
      });
    }
  }
  
  return createResponse(false, 'User not found');
}

// Update user data
function updateUserData(username, points, leisureSeconds) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find and update user
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      sheet.getRange(i + 1, 3).setValue(Number(points) || 0);
      sheet.getRange(i + 1, 4).setValue(Number(leisureSeconds) || 0);
      sheet.getRange(i + 1, 6).setValue(new Date());
      return createResponse(true, 'User data updated');
    }
  }
  
  return createResponse(false, 'User not found');
}

// Update username
function updateUsername(oldUsername, newUsername) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Convert to strings and trim
  const oldUser = String(oldUsername).trim();
  const newUser = String(newUsername).trim();
  
  // Check if new username already exists
  for (let i = 1; i < data.length; i++) {
    const existingUsername = String(data[i][0]).trim();
    if (existingUsername.toLowerCase() === newUser.toLowerCase() && existingUsername !== oldUser) {
      return createResponse(false, 'Username already taken');
    }
  }
  
  // Find and update user
  for (let i = 1; i < data.length; i++) {
    const currentUsername = String(data[i][0]).trim();
    if (currentUsername === oldUser) {
      sheet.getRange(i + 1, 1).setValue(newUser);
      sheet.getRange(i + 1, 6).setValue(new Date());
      return createResponse(true, 'Username updated');
    }
  }
  
  return createResponse(false, 'User not found');
}

// Create JSON response
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
