import { getOrganizationById } from '../queries';
import { getOrganizationsCollection } from '~/lib/server/collections';

/**
 * @name getCurrentOrganization
 * @description Fetch the selected organization (or the first one in the list)
 */
export async function getCurrentOrganization(
  userId: string,
  organizationId: Maybe<string> = undefined,
) {
  return getOrganizationByIdOrFirst(organizationId, userId);
}

/**
 * @name getOrganizationByIdOrFirst
 * @description Given a user ID {@link userId}, this function will return
 * either:
 *
 * 1. The organizationId passed as first parameter, if passed
 * 2. Or, in case of errors, the first organization found the user belongs to as
 * fallback
 *
 * @param organizationId
 * @param userId
 */
async function getOrganizationByIdOrFirst(
  organizationId: Maybe<string>,
  userId: string,
) {
  // if the organization ID was passed from the cookie, we try read that
  if (organizationId) {
    const organization = await getOrganizationData(organizationId);

    // check the user ID belongs to the organization members
    const userBelongsToOrganization = userId in (organization?.members ?? {});

    // if the user doesn't have permissions to access
    // the organization, we simply return the first one
    if (userBelongsToOrganization) {
      return organization;
    }
  }

  return getFirstOrganization(userId);
}

async function getFirstOrganization(userId: string) {
  try {
    const organizations = await getOrganizationsByUserId(userId).limit(1).get();
    const doc = organizations.docs[0];

    return serializeOrganizationData(doc.data(), doc.id);
  } catch (e) {
    return null;
  }
}

async function getOrganizationData(organizationId: string) {
  const organization = await getOrganizationById(organizationId);
  const data = organization.data();

  return data ? serializeOrganizationData(data, organizationId) : undefined;
}

function serializeOrganizationData(organization: any, id: string) {
  const members = Object.keys(organization.members).reduce((acc, userId) => {
    const member = organization.members[userId];

    const item = {
      role: member.role,
      user: member.user.id,
    };

    return {
      ...acc,
      [userId]: item,
    };
  }, {});

  return {
    ...organization,
    members,
    id,
  };
}

function getOrganizationsByUserId(userId: string) {
  const organizations = getOrganizationsCollection();
  const path = `members.${userId}`;

  return organizations.where(path, '!=', null);
}
