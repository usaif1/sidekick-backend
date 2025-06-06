const axios = require("axios");
const { graphqlRequest } = require("../utils/hasuraRequest");

const createNewUser = async ({
  email,
  firebase_id,
  full_name,
  phone_number,
}) => {
  const query = `
    mutation MyMutation($email: String, $firebase_id: String, $full_name: String, $phone_number: String) {
      insert_users_one(object: { full_name: $full_name, email: $email, firebase_id: $firebase_id, phone_number: $phone_number }) {
        id
      }
    }
  `;
  const variables = { email, firebase_id, full_name, phone_number };
  const result = await graphqlRequest(query, variables);
  console.log("result", JSON.stringify(result));
  return result.data.insert_users_one.id;
};

const createUserWallet = async (user_id) => {
  const query = `
    mutation createWallet($object: wallets_insert_input!) {
      insert_wallets_one(object: $object) {
        id
      }
    }
  `;
  const variables = { object: { user_id, wallet_type: "USER" } };
  await graphqlRequest(query, variables);
};

// const startFetchFetchScooterByNumber = async (_ilike) => {
//   const query = `
//     query fetchScooterByNumber($_ilike: String!) {
//       scooters(where: { registration_number: { _ilike: $_ilike } }) {
//         registration_number
//         id
//       }
//     }
//   `;
//   const variables = { _ilike };
//   const result = await graphqlRequest(query, variables);
//   return result.data.scooters[0];
// };

const createUserOrg = async ({ organization_id, user_id }) => {
  const query = `
    mutation createUserOrg($organization_id: uuid = "", $user_id: uuid = "") {
      insert_user_organizations_one(object: {organization_id: $organization_id, user_id: $user_id}) {
        id
      }
    }
  `;
  const variables = { organization_id, user_id };
  console.log("Creating user_org with variables:", variables);

  try {
    const result = await graphqlRequest(query, variables);
    console.log("createUserOrg result:", JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("Error in createUserOrg GraphQL request:", err);
    throw err;
  }
};

const createOrganization = async ({ email, name }) => {
  const query = `
    mutation createOrg($email: String = "", $name: String = "") {
      insert_organizations_one(object: {email: $email, name: $name}) {
        id
      }
    }
  `;
  const variables = { email, name };
  const result = await graphqlRequest(query, variables);
  console.log("result", JSON.stringify(result));
  return result.data.insert_organizations_one.id;
};

const createOrganizationWallet = async (org_id) => {
  const query = `
    mutation createWallet($object: wallets_insert_input!) {
      insert_wallets_one(object: $object) {
        id
      }
    }
  `;
  const variables = { object: { org_id, wallet_type: "ORG" } };
  await graphqlRequest(query, variables);
};
module.exports = {
  createNewUser,
  createUserWallet,
  createOrganizationWallet,
  // startFetchFetchScooterByNumber,
  createOrganization,
  createUserOrg,
};
