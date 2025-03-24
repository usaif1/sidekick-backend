const axios = require("axios");

const createNewUser = async (args) => {
  const data = JSON.stringify({
    query: `mutation MyMutation($email: String = "", $firebase_id: String = "", $full_name: String = "", $phone_number: String = "") {
  insert_users_one(object: {full_name: $full_name, email: $email, firebase_id: $firebase_id, phone_number: $phone_number}) {
    email
    full_name
    id
    phone_number
  }
}
`,
    variables: {
      email: args.email,
      firebase_id: args.firebase_id,
      full_name: args.full_name,
      phone_number: args.phone_number,
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://supreme-mustang-86.hasura.app/v1/graphql",
    headers: {
      "x-hasura-admin-secret":
        "gVpDomfT4GaYV76w7CmCLmWidk117lEJwrdqckLAnC8H2e62nLfXXS6ehzEAISu3",
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  console.log("response = ", response.data);
  return response.data.data.insert_users_one.id;
};

const createUserWallet = async (user_id) => {
  console.log("user_id", user_id);

  const data = JSON.stringify({
    query: `mutation createWallet($object: wallets_insert_input = {}) {
      insert_wallets_one(object: $object) {
        balance
        created_at
        id
      }
    }`,
    variables: {
      object: {
        user_id: user_id,
        wallet_type: "USER",
      },
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://supreme-mustang-86.hasura.app/v1/graphql",
    headers: {
      "x-hasura-admin-secret":
        "gVpDomfT4GaYV76w7CmCLmWidk117lEJwrdqckLAnC8H2e62nLfXXS6ehzEAISu3",
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = {
  createNewUser,
  createUserWallet,
};
