-- Auto-delete expired profile photos + profile-photos storage policies
-- (from scripts/08-auto-delete-expired-images.sql)
-- NOTE: the original used `CREATE POLICY IF NOT EXISTS`, which is NOT valid
-- PostgreSQL syntax. Converted to DROP POLICY IF EXISTS + CREATE POLICY.
-- This function ONLY affects the 'profile-photos' bucket; other buckets are never touched.

CREATE OR REPLACE FUNCTION delete_expired_profile_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_file RECORD;
    file_path TEXT;
    target_bucket_name TEXT := 'profile-photos';
    deleted_count INTEGER := 0;
BEGIN
    IF target_bucket_name != 'profile-photos' THEN
        RAISE EXCEPTION 'SAFETY VIOLATION: Function must only target profile-photos bucket!';
    END IF;

    RAISE NOTICE 'Starting cleanup of expired images from PROFILE-PHOTOS bucket ONLY...';
    RAISE NOTICE 'Target bucket: %, Other buckets (generated-images, etc.) will NOT be affected', target_bucket_name;

    FOR expired_file IN
        SELECT bucket_id, name, created_at, owner
        FROM storage.objects
        WHERE bucket_id = target_bucket_name
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        BEGIN
            IF expired_file.bucket_id != 'profile-photos' THEN
                RAISE EXCEPTION 'SAFETY VIOLATION: Attempted to delete from bucket % instead of profile-photos!', expired_file.bucket_id;
            END IF;

            file_path := expired_file.name;

            DELETE FROM storage.objects
            WHERE bucket_id = 'profile-photos'
            AND name = expired_file.name
            AND bucket_id = target_bucket_name;

            deleted_count := deleted_count + 1;

            RAISE NOTICE 'Deleted expired PROFILE image: % (owner: %, created: %)',
                file_path, expired_file.owner, expired_file.created_at;

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to delete profile image %: %', file_path, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Cleanup completed: Deleted % files from PROFILE-PHOTOS bucket only', deleted_count;
    RAISE NOTICE 'Generated-images and other buckets remain UNTOUCHED';
END;
$$;

GRANT EXECUTE ON FUNCTION delete_expired_profile_images() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_expired_profile_images() TO service_role;

CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    expired_file RECORD;
    target_bucket_name TEXT := 'profile-photos';
    total_files_checked INTEGER := 0;
BEGIN
    IF target_bucket_name != 'profile-photos' THEN
        RAISE EXCEPTION 'CRITICAL SAFETY ERROR: Function hardcoded to profile-photos only!';
    END IF;

    SELECT COUNT(*) INTO total_files_checked
    FROM storage.objects
    WHERE bucket_id = target_bucket_name
    AND created_at < NOW() - INTERVAL '24 hours';

    FOR expired_file IN
        SELECT bucket_id, name, created_at, owner
        FROM storage.objects
        WHERE bucket_id = target_bucket_name
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        BEGIN
            IF expired_file.bucket_id != 'profile-photos' THEN
                RAISE EXCEPTION 'SAFETY BREACH: File % is from bucket % not profile-photos!',
                    expired_file.name, expired_file.bucket_id;
            END IF;

            DELETE FROM storage.objects
            WHERE bucket_id = 'profile-photos'
            AND name = expired_file.name
            AND bucket_id = target_bucket_name;

            deleted_count := deleted_count + 1;

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to delete profile image %: %', expired_file.name, SQLERRM;
        END;
    END LOOP;

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

GRANT EXECUTE ON FUNCTION cleanup_expired_images() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_images() TO service_role;

-- NOTE: the original script ran `ALTER TABLE storage.objects ENABLE ROW LEVEL
-- SECURITY` here. That is omitted: RLS is already enabled on storage.objects by
-- default, and the migration role (postgres) is not its owner, so the statement
-- errors with "must be owner of table objects".

-- Storage policies for profile-photos (scoped to the owner's folder).
DROP POLICY IF EXISTS "Users can view own profile photos" ON storage.objects;
CREATE POLICY "Users can view own profile photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Informational views
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

GRANT SELECT ON expiring_profile_images TO authenticated;
GRANT SELECT ON expiring_profile_images TO service_role;
