-- Fix RLS policy for profiles table to allow users to create their own profile

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can access their organization profiles" ON profiles;

-- Create new policies that allow users to manage their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Allow users to view profiles in their organization (for admin functions)
CREATE POLICY "Users can view organization profiles" ON profiles
    FOR SELECT USING (
        organization_id IS NOT NULL 
        AND organization_id = (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    );