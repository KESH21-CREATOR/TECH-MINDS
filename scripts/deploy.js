const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("  Deploying AcademicCredentialRegistry Contract   ");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const defaultInstitution = "CredentialChain Demo University";
  const RegistryFactory = await hre.ethers.getContractFactory("AcademicCredentialRegistry");
  const registry = await RegistryFactory.deploy(defaultInstitution);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const network = await hre.ethers.provider.getNetwork();

  console.log("\n Contract Successfully Deployed!");
  console.log("--------------------------------------------------");
  console.log(" Contract Address :", contractAddress);
  console.log(" Network Name     :", network.name);
  console.log(" Chain ID         :", network.chainId.toString());
  console.log(" Institution Name :", defaultInstitution);
  console.log(" Deployer Address :", deployer.address);
  console.log("--------------------------------------------------\n");

  // Get contract artifact for ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AcademicCredentialRegistry.sol/AcademicCredentialRegistry.json");
  let artifact = {};
  if (fs.existsSync(artifactPath)) {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  const configData = {
    contractAddress: contractAddress,
    abi: artifact.abi || [],
    networkName: network.name === "unknown" ? "localhost" : network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    defaultInstitution: defaultInstitution,
    deployerAddress: deployer.address,
    rpcUrl: "http://127.0.0.1:8545"
  };

  // 1. Write to backend config
  const backendConfigDir = path.join(__dirname, "../backend/src/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  const backendConfigFile = path.join(backendConfigDir, "contractConfig.json");
  fs.writeFileSync(backendConfigFile, JSON.stringify(configData, null, 2));
  console.log(" Saved config to backend: backend/src/config/contractConfig.json");

  // 2. Write to frontend config
  const frontendConfigDir = path.join(__dirname, "../frontend/src");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  const frontendConfigFile = path.join(frontendConfigDir, "contractConfig.json");
  fs.writeFileSync(frontendConfigFile, JSON.stringify(configData, null, 2));
  console.log(" Saved config to frontend: frontend/src/contractConfig.json");

  // 3. Write to root config for reference
  fs.writeFileSync(path.join(__dirname, "../contractConfig.json"), JSON.stringify(configData, null, 2));

  console.log("\n Configuration synchronization complete.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
