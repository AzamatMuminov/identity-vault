// scripts/generateVC.js

const { createVerifiableCredentialJwt } = require("did-jwt-vc");
const { Resolver }                    = require("did-resolver");
const { getResolver }                 = require("ethr-did-resolver");
const { ES256KSigner }                = require("did-jwt");

async function main() {
  // 1) DID resolver pointing at local Hardhat
  const providerConfig = {
    name: "development",
    rpcUrl: "http://127.0.0.1:8545"
  };
  const resolver = new Resolver(getResolver(providerConfig));

  // 2) Use your Hardhat account #0's address and private key
  const issuerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const issuerPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  // 3) Convert hex to raw bytes buffer (without "0x")
  const hex = issuerPrivateKey.replace(/^0x/, "");
  const keyBuffer = Buffer.from(hex, "hex"); // 32 bytes

  // 4) Create ES256K signer using the Buffer
  const signer = ES256KSigner(keyBuffer);

  // 5) Build issuer DID
  const issuer = {
    did: `did:ethr:${issuerAddress}`,
    signer
  };

  // 6) Prepare a simple VC payload (subject using Hardhat account #1)
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

  // 7) Create and print the VC JWT
  try {
    const jwt = await createVerifiableCredentialJwt(vcPayload, issuer, { resolver });
    console.log("VC JWT:", jwt);
  } catch (err) {
    console.error("Error generating VC JWT:", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
