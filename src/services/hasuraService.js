const { graphqlRequest } = require("../utils/hasuraRequest");
const admin = require("firebase-admin");

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

// 1️⃣  Minimal – create a phone-auth user
const createEmployee = async (employeeData) => {
  const { full_name, phone_number, email, organization_id, employeeId } =
    employeeData;

  try {
    const userRecord = await admin.auth().createUser({
      phoneNumber: phone_number, // e.g. '+919876543210'
      disabled: false, // optional
    });

    // Default role - you may want to pass this as a parameter
    const role = "user"; // or determine based on your business logic

    const hasuraClaims = {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": role,
        "x-hasura-allowed-roles": [role],
        "x-hasura-user-id": userRecord.uid,
        "x-hasura-organization-id": organization_id,
      },
    };
    await admin.auth().setCustomUserClaims(userRecord.uid, hasuraClaims);

    const userId = await createNewUser({
      full_name,
      phone_number,
      email,
      firebase_id: userRecord.uid,
    });
    await createUserWallet(userId);

    return userRecord; // contains uid, provider info, etc.
  } catch (error) {
    console.error("Error in createEmployee:", error);
    throw error;
  }
};

const checkUserExists = async (phone_number) => {
  try {
    const user = await admin.auth().getUserByPhoneNumber(phone_number);
    return user;
  } catch (error) {
    console.error("Error in checkUserExists:", error);
    throw error;
  }
};

module.exports = {
  createNewUser,
  createUserWallet,
  // startFetchFetchScooterByNumber,
  createUserOrg,
  createEmployee,
  checkUserExists,
};
