# Auto-Cleanup for Uploaded Images

## Overview
The system automatically deletes uploaded profile images after 24 hours to maintain storage efficiency and comply with temporary file policies.

## Implementation

### 1. Database Functions
- `delete_expired_profile_images()`: Core cleanup function
- `cleanup_expired_images()`: HTTP-callable version that returns JSON results
- `expiring_profile_images`: View to check images expiring in next 2 hours

### 2. API Endpoint
- **URL**: `/api/cleanup-expired-images`
- **Method**: POST
- **Headers**: `x-api-key: your-secret-cleanup-key`

### 3. Setup Instructions

#### Step 1: Run the SQL Script
Execute the script `scripts/08-auto-delete-expired-images.sql` in your Supabase SQL editor.

#### Step 2: Set Environment Variable
Add to your `.env.local`:
```
CLEANUP_API_KEY=your-super-secret-cleanup-key-here
```

#### Step 3: Enable pg_cron (Optional)
For automatic scheduling, enable the `pg_cron` extension in Supabase:
1. Go to Supabase Dashboard → Database → Extensions
2. Enable `pg_cron`
3. Uncomment the cron.schedule lines in the SQL script

#### Step 4: Set Up External Cron Job
If not using pg_cron, set up an external cron job to call the API:

**Example cron job (runs every hour):**
```bash
# Add to your crontab (crontab -e)
0 * * * * curl -X POST -H "x-api-key: your-secret-cleanup-key" https://your-domain.com/api/cleanup-expired-images
```

**Example GitHub Actions (runs every hour):**
```yaml
name: Cleanup Expired Images
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup endpoint
        run: |
          curl -X POST \
            -H "x-api-key: ${{ secrets.CLEANUP_API_KEY }}" \
            https://your-domain.com/api/cleanup-expired-images
```

## Features

### User Interface
- ⏰ **Real-time countdown**: Shows time remaining until deletion
- 🔴 **Expired indicator**: Visual indication when files have expired
- 📥 **Download before expiry**: Users can download files before deletion
- 🗑️ **Manual deletion**: Users can delete files early
- ⚠️ **Clear warnings**: Prominent notice about 24-hour policy

### Backend Processing
- 🔄 **Automatic cleanup**: Scheduled deletion of expired files
- 📊 **Cleanup reporting**: Returns count of deleted files
- 🛡️ **Error handling**: Continues processing even if individual files fail
- 🔐 **Security**: RLS policies ensure users only access their own files

## Testing

### Manual Cleanup Test
```bash
curl -X POST \
  -H "x-api-key: your-secret-cleanup-key" \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/cleanup-expired-images
```

### Check Expiring Images
```sql
SELECT * FROM expiring_profile_images;
```

### Manual Function Call
```sql
SELECT cleanup_expired_images();
```

## Storage Policies

The system includes Row Level Security policies for the `profile-photos` bucket:

1. **View Policy**: Users can only see their own files
2. **Delete Policy**: Users can only delete their own files  
3. **Upload Policy**: Users can only upload to their own folder

## Monitoring

### Check Recent Uploads
```sql
SELECT 
  name,
  created_at,
  (created_at + INTERVAL '24 hours') as expires_at,
  CASE 
    WHEN created_at < NOW() - INTERVAL '24 hours' THEN 'EXPIRED'
    WHEN created_at < NOW() - INTERVAL '22 hours' THEN 'EXPIRING SOON'
    ELSE 'ACTIVE'
  END as status
FROM storage.objects 
WHERE bucket_id = 'profile-photos'
ORDER BY created_at DESC;
```

### View Cleanup Logs
Check your application logs for cleanup results and any errors during the deletion process.

## Security Considerations

1. **API Key Protection**: Store the cleanup API key securely
2. **Rate Limiting**: Consider adding rate limiting to the cleanup endpoint
3. **Access Control**: Only authorized systems should trigger cleanup
4. **Backup Strategy**: Consider if you need any backup before deletion

## Troubleshooting

### Common Issues

1. **Images not deleting**: Check if pg_cron is enabled and job is scheduled
2. **Permission errors**: Verify RLS policies are correctly set
3. **API authentication**: Ensure correct API key is being used
4. **Storage access**: Check if storage permissions are configured

### Debug Queries

```sql
-- Check what would be deleted
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND created_at < NOW() - INTERVAL '24 hours';

-- Count files by age
SELECT 
  CASE 
    WHEN created_at < NOW() - INTERVAL '24 hours' THEN 'EXPIRED'
    WHEN created_at < NOW() - INTERVAL '22 hours' THEN 'EXPIRING SOON'
    ELSE 'ACTIVE'
  END as status,
  COUNT(*) as count
FROM storage.objects 
WHERE bucket_id = 'profile-photos'
GROUP BY 1;
``` 