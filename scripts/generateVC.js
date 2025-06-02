// scripts/generateVC.js

const { createVerifiableCredentialJwt } = require("did-jwt-vc");
const { Resolver }                    = require("did-resolver");
const { getResolver }                 = require("ethr-did-resolver");
const { ES256KSigner }                = require("did-jwt");

async function main() {
  // 1) Build a DID resolver that knows how to resolve eth addresses on your local Hardhat node
  const providerConfig = {
    name: "development",
    rpcUrl: "http://127.0.0.1:8545"
  };
  const resolver = new Resolver(getResolver(providerConfig));

  // 2) Choose one of your Hardhat accounts as the issuer
  //    Replace with the account + private key from your `npx hardhat node` output.
  const issuerAddress = " 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const issuerPrivateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

  // 3) Create an ES256K signer from the private key
  //    ES256KSigner expects the private key **without** the 0x prefix.
  const pkWithout0x = issuerPrivateKey.replace(/^0x/, "");
  const signer = ES256KSigner(pkWithout0x);

  // 4) Set up your issuer DID object with `did` and `signer`
  const issuer = {
    did: `did:ethr:${issuerAddress}`,
    signer: signer
  };

  // 5) Build a simple VC payload
  //    For "sub" you can use any other Hardhat account DID. Here we use Account #1.
  const vcPayload = {
    sub: "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      credentialSubject: {
        id: "did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        degree: {
          type: "BachelorDegree",
          name: "B.Sc. Computer Science"
        }
      }
    }
  };

  // 6) Create the verifiable credential JWT
  const jwt = await createVerifiableCredentialJwt(vcPayload, issuer, { resolver });
  console.log("VC JWT:", jwt);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
