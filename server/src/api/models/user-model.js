import {dbError} from '../../utils/http-error.js';

/**
 * Finds the USERS row linked to a Supabase auth user.
 *
 * @param {object} client - Supabase client (user client)
 * @param {string} authUserId - Supabase auth user id
 * @param {string} columns - columns to select
 * @return {Promise<object|null>}
 */
const findProfileByAuthId = async (client, authUserId, columns = 'user_id') => {
  const {data, error} = await client
    .from('USERS')
    .select(columns)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw dbError(error, 'Could not load user profile');
  return data;
};

export {findProfileByAuthId};
