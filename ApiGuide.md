#### 1. Artist Registration
```
POST /api/auth/register/artist
Content-Type: application/json

{
    "email": "artist@example.com",
    "password": "password123"
}
```

#### 2. Company Registration (Admin Only)
```
POST /api/auth/register/company
Content-Type: application/json

{
    "email": "company@example.com",
    "password": "password123"
}
```

#### 3. Login
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

#### 4. Email Verification
```
GET /api/auth/verify?token={verification_token}
```

### Artist Endpoints

#### 1. Create Profile
```
POST /api/artist/profile
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "firstName": "John",
    "surname": "Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "nationality": "American",
    "occupation": "Musician",
    "accountHolderName": "John Doe",
    "bankAccountNumber": "1234567890"
}
```

#### 2. Upload Passport Photo
```
POST /api/artist/passport-photo
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [image file]
imageTitle: "Passport Photo"
```

#### 3. Upload Proof of Payment
```
POST /api/artist/proof-of-payment
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [PDF file]
documentTitle: "Proof of Payment"
```

#### 4. Upload Bank Confirmation Letter
```
POST /api/artist/bank-confirmation-letter
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [PDF file]
documentTitle: "Bank Confirmation Letter"
```

#### 5. Upload ID Document
```
POST /api/artist/id-document
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [PDF file]
documentTitle: "ID Document"
```

#### 6. Upload Music
```
POST /api/artist/music/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [audio/video file]
title: "Song Title"
```

#### 7. Get My Music
```
GET /api/artist/music
Authorization: Bearer {jwt_token}
```

#### 8. Get My Documents
```
GET /api/artist/documents
Authorization: Bearer {jwt_token}
```

### Admin Endpoints

#### 1. Get Pending Profiles
```
GET /api/admin/pending-profiles
Authorization: Bearer {jwt_token}
```

#### 2. Approve Profile
```
POST /api/admin/profile/approve/{memberId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "ipiNumber": "IPI123456789"
}
```

#### 3. Reject Profile
```
POST /api/admin/profile/reject/{memberId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "notes": "Missing required documents"
}
```

#### 4. Get Pending Music
```
GET /api/admin/pending-music
Authorization: Bearer {jwt_token}
```

#### 5. Approve Music
```
POST /api/admin/music/approve/{musicId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "isrcCode": "ISRC123456789"
}
```

#### 6. Reject Music
```
POST /api/admin/music/reject/{musicId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "notes": "Audio quality too low"
}
```

#### 7. Create Company
```
POST /api/admin/company/create
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "email": "company@example.com",
    "password": "password123",
    "companyName": "Radio Station XYZ",
    "companyAddress": "123 Main St, City",
    "companyPhone": "+1234567890",
    "contactPerson": "John Manager"
}
```

### Company Endpoints

#### 1. Get Company Profile
```
GET /api/company/profile
Authorization: Bearer {jwt_token}
```

#### 2. Get Approved Music
```
GET /api/company/approved-music
Authorization: Bearer {jwt_token}
```

#### 3. Create LogSheet
```
POST /api/company/logsheet
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "title": "Morning Show Playlist",
    "musicIds": [1, 2, 3]
}
```

#### 4. Get LogSheets
```
GET /api/company/logsheets
Authorization: Bearer {jwt_token}
```
