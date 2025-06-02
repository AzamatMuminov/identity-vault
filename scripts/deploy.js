async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const Recovery = await ethers.getContractFactory("Recovery");
  const guardians = [
    deployer.address,
    "0x0000000000000000000000000000000000000001"
  ];
  const recovery = await Recovery.deploy(guardians);
  await recovery.deployed();

  console.log("Recovery deployed to:", recovery.address);
}

main().catch((e) => { console.error(e); process.exit(1); });