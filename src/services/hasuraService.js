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

const startFetchFetchScooterByNumber = async (_ilike) => {
  const query = `
    query fetchScooterByNumber($_ilike: String!) {
      scooters(where: { registration_number: { _ilike: $_ilike } }) {
        registration_number
        id
      }
    }
  `;
  const variables = { _ilike };
  const result = await graphqlRequest(query, variables);
  return result.data.scooters[0];
};

module.exports = {
  createNewUser,
  createUserWallet,
  startFetchFetchScooterByNumber,
};
