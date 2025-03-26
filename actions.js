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

/*
This is an example snippet - you should consider tailoring it
to your service.
*/

async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    "https://supreme-mustang-86.hasura.app/v1/graphql",
    {
      method: "POST",
      headers: {
        "x-hasura-admin-secret":
          "gVpDomfT4GaYV76w7CmCLmWidk117lEJwrdqckLAnC8H2e62nLfXXS6ehzEAISu3",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    }
  );

  return await result.json();
}

const operationsDoc = `
  query fetchScooterByNumber($_ilike: String = "SCOOTER1") {
    scooters(where: {registration_number: {_ilike: $_ilike}}) {
      registration_number
      id
    }
  }
`;

function fetchFetchScooterByNumber(_ilike) {
  return fetchGraphQL(operationsDoc, "fetchScooterByNumber", {
    _ilike: _ilike,
  });
}

async function startFetchFetchScooterByNumber(_ilike) {
  const { errors, data } = await fetchFetchScooterByNumber(_ilike);

  if (errors) {
    // handle those errors like a pro
    console.error(errors);
  }

  // do something great with this precious data
  console.log(data);
  return data?.scooters[0];
}

module.exports = {
  createNewUser,
  createUserWallet,
  startFetchFetchScooterByNumber,
};
