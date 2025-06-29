-- ⚠️  CRITICAL WARNING: This function ONLY affects the 'profile-photos' bucket
-- 🔒 SAFETY MEASURE: Generated images and other buckets are NEVER touched
-- 📝 PURPOSE: Auto-delete user uploaded profile photos after 24 hours ONLY

-- Create a function to delete expired images ONLY from profile-photos bucket
CREATE OR REPLACE FUNCTION delete_expired_profile_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_file RECORD;
    file_path TEXT;
    target_bucket_name TEXT := 'profile-photos'; -- ONLY this bucket!
    deleted_count INTEGER := 0;
BEGIN
    -- SAFETY CHECK: Verify we're only targeting profile-photos bucket
    IF target_bucket_name != 'profile-photos' THEN
        RAISE EXCEPTION 'SAFETY VIOLATION: Function must only target profile-photos bucket!';
    END IF;
    
    -- Log the start of cleanup with explicit bucket name
    RAISE NOTICE 'Starting cleanup of expired images from PROFILE-PHOTOS bucket ONLY...';
    RAISE NOTICE 'Target bucket: %, Other buckets (generated-images, etc.) will NOT be affected', target_bucket_name;
    
    -- Find files older than 24 hours ONLY in profile-photos bucket
    FOR expired_file IN 
        SELECT 
            bucket_id,
            name,
            created_at,
            owner
        FROM storage.objects 
        WHERE bucket_id = target_bucket_name -- EXPLICIT bucket check
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        BEGIN
            -- DOUBLE SAFETY CHECK: Ensure we're only deleting from profile-photos
            IF expired_file.bucket_id != 'profile-photos' THEN
                RAISE EXCEPTION 'SAFETY VIOLATION: Attempted to delete from bucket % instead of profile-photos!', expired_file.bucket_id;
            END IF;
            
            -- Construct the full file path
            file_path := expired_file.name;
            
            -- Delete the file ONLY from profile-photos bucket
            DELETE FROM storage.objects 
            WHERE bucket_id = 'profile-photos' 
            AND name = expired_file.name
            AND bucket_id = target_bucket_name; -- Extra safety check
            
            deleted_count := deleted_count + 1;
            
            -- Log successful deletion
            RAISE NOTICE 'Deleted expired PROFILE image: % (owner: %, created: %)', 
                file_path, expired_file.owner, expired_file.created_at;
                
        EXCEPTION WHEN OTHERS THEN
            -- Log any errors but continue processing
            RAISE WARNING 'Failed to delete profile image %: %', file_path, SQLERRM;
        END;
    END LOOP;
    
    -- Log completion with summary
    RAISE NOTICE 'Cleanup completed: Deleted % files from PROFILE-PHOTOS bucket only', deleted_count;
    RAISE NOTICE 'Generated-images and other buckets remain UNTOUCHED';
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION delete_expired_profile_images() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_expired_profile_images() TO service_role;

-- Create a function that can be called via HTTP/Edge Function
-- ⚠️  EXPLICIT SAFETY: ONLY affects profile-photos bucket, NEVER generated-images
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    expired_file RECORD;
    target_bucket_name TEXT := 'profile-photos'; -- HARDCODED for safety
    total_files_checked INTEGER := 0;
BEGIN
    -- MANDATORY SAFETY CHECK
    IF target_bucket_name != 'profile-photos' THEN
        RAISE EXCEPTION 'CRITICAL SAFETY ERROR: Function hardcoded to profile-photos only!';
    END IF;
    
    -- Count total files that will be checked
    SELECT COUNT(*) INTO total_files_checked
    FROM storage.objects 
    WHERE bucket_id = target_bucket_name 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    -- Count and delete expired files ONLY from profile-photos bucket
    FOR expired_file IN 
        SELECT 
            bucket_id,
            name,
            created_at,
            owner
        FROM storage.objects 
        WHERE bucket_id = target_bucket_name -- EXPLICIT safety check
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        BEGIN
            -- TRIPLE SAFETY CHECK: Only delete from profile-photos
            IF expired_file.bucket_id != 'profile-photos' THEN
                RAISE EXCEPTION 'SAFETY BREACH: File % is from bucket % not profile-photos!', 
                    expired_file.name, expired_file.bucket_id;
            END IF;
            
            -- Delete the file ONLY from profile-photos bucket
            DELETE FROM storage.objects 
            WHERE bucket_id = 'profile-photos' 
            AND name = expired_file.name
            AND bucket_id = target_bucket_name; -- Double verification
            
            deleted_count := deleted_count + 1;
                
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue
            RAISE WARNING 'Failed to delete profile image %: %', expired_file.name, SQLERRM;
        END;
    END LOOP;
    
    -- Return result as JSON with safety confirmation
    RETURN json_build_object(
        'success', true,
        'target_bucket', target_bucket_name,
        'protected_buckets', ARRAY['generated-images', 'any-other-bucket'],
        'files_checked', total_files_checked,
        'deleted_count', deleted_count,
        'cleanup_time', NOW(),
        'safety_confirmation', 'ONLY profile-photos affected, generated-images UNTOUCHED',
        'message', format('Successfully deleted %s expired PROFILE images from %s bucket only', deleted_count, target_bucket_name)
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_images() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_images() TO service_role;

-- Enable Row Level Security on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ⚠️  STORAGE POLICIES: These ONLY apply to 'profile-photos' bucket
-- 🔒 Generated-images bucket has separate policies and NO auto-deletion

-- Create policy to allow users to view their own PROFILE photos ONLY
CREATE POLICY IF NOT EXISTS "Users can view own profile photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-photos'  -- EXPLICIT bucket restriction
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Create policy to allow users to delete their own PROFILE photos ONLY  
CREATE POLICY IF NOT EXISTS "Users can delete own profile photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-photos'  -- EXPLICIT bucket restriction
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Create policy to allow users to upload PROFILE photos ONLY
CREATE POLICY IF NOT EXISTS "Users can upload own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'  -- EXPLICIT bucket restriction
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- 🛡️  SAFETY VERIFICATION: Check that generated-images bucket is protected
-- This view shows which buckets have auto-deletion (only profile-photos should)
CREATE OR REPLACE VIEW bucket_deletion_policies AS
SELECT 
    bucket_id,
    CASE 
        WHEN bucket_id = 'profile-photos' THEN '24-HOUR AUTO-DELETE'
        WHEN bucket_id = 'generated-images' THEN 'PERMANENT (NO AUTO-DELETE)'
        ELSE 'PERMANENT (NO AUTO-DELETE)'
    END as deletion_policy,
    COUNT(*) as file_count
FROM storage.objects 
GROUP BY bucket_id
ORDER BY bucket_id;

GRANT SELECT ON bucket_deletion_policies TO authenticated;

-- Create a scheduled job to run cleanup every hour (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled in your Supabase instance
-- You can enable it in the Supabase dashboard under Database > Extensions

-- SELECT cron.schedule(
--     'cleanup-expired-profile-images',  -- job name
--     '0 * * * *',                       -- every hour
--     'SELECT delete_expired_profile_images();'
-- );

-- Alternative: Manual execution query for testing
-- SELECT cleanup_expired_images();

-- View to check for images that will expire soon (next 2 hours)
CREATE OR REPLACE VIEW expiring_profile_images AS
SELECT 
    bucket_id,
    name,
    created_at,
    owner,
    (created_at + INTERVAL '24 hours') AS expires_at,
    EXTRACT(EPOCH FROM (created_at + INTERVAL '24 hours' - NOW())) / 3600 AS hours_until_expiry
FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND created_at > NOW() - INTERVAL '24 hours'
AND created_at < NOW() - INTERVAL '22 hours'
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON expiring_profile_images TO authenticated;
GRANT SELECT ON expiring_profile_images TO service_role; 