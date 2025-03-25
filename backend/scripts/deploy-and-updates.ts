import { execSync } from "child_process"
import fs from "fs-extra"
import path from "path"

// Paths
const FRONTEND_CONFIG_PATH = path.join(
  __dirname,
  "../../frontend/app/config/contract.ts"
)
const BASE_ARTIFACTS_DIR = path.join(__dirname, "../artifacts/contracts")

// Define expected contracts under Chain4GoodModule
const EXPECTED_CONTRACTS: Record<string, string> = {
  Chain4Good: "Chain4Good",
  VeraToken: "VeraToken",
}

interface FrontendConfig {
  [key: string]: {
    address: string
    abi: any
  }
}

// Function to execute shell command and return output
function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: "utf-8" }).trim()
  } catch (error) {
    console.error(`Error executing command: ${command}`, error)
    process.exit(1)
  }
}

// Deploy contract using Hardhat Ignition
function deployContracts(): Record<string, string> {
  console.log("Deploying contract using Ignition...")
  const output = runCommand(
    "npx hardhat ignition deploy ignition/modules/Chain4Good.ts --network localhost"
  )

  console.log("Raw deployment output:\n", output)

  const deployedContracts: Record<string, string> = {}

  // Extract contract addresses from output
  const regex = /DonationPoolsModule#(\w+) - (0x[a-fA-F0-9]{40})/g
  let match
  while ((match = regex.exec(output)) !== null) {
    const [_, contractName, address] = match
    if (EXPECTED_CONTRACTS[contractName]) {
      deployedContracts[contractName] = address
    }
  }

  if (Object.keys(deployedContracts).length === 0) {
    console.error("No contracts found under Chain4GoodModule.")
    process.exit(1)
  }

  console.log("Extracted deployed contract addresses:", deployedContracts)
  return deployedContracts
}

// Read ABI from compiled artifacts
async function getContractAbi(contractName: string): Promise<any> {
  // Determine correct path for ABI
  const artifactPath =
    // contractName === "Governors" || contractName === "MyTimelock"
    //   ? path.join(
    //       GOVERNANCE_ARTIFACTS_DIR,
    //       `${contractName}.sol/${contractName}.json`
    //     )
    //   :
    path.join(BASE_ARTIFACTS_DIR, `${contractName}.sol/${contractName}.json`)

  if (!fs.existsSync(artifactPath)) {
    console.error(`Contract artifact not found: ${artifactPath}`)
    process.exit(1)
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"))
  return artifact.abi
}

// Update frontend config file
async function updateFrontendConfig(deployedContracts: Record<string, string>) {
  let config: FrontendConfig = {}

  try {
    const configModule = await import(`file://${FRONTEND_CONFIG_PATH}`)
    config = configModule.default
  } catch (error) {
    console.warn("No existing config found, creating a new one.")
  }

  // Update contract details in the frontend config
  for (const [moduleContractName, address] of Object.entries(
    deployedContracts
  )) {
    const contractName = EXPECTED_CONTRACTS[moduleContractName] // Map module name to artifact name
    config[moduleContractName] = {
      address,
      abi: await getContractAbi(contractName),
    }
  }

  await fs.writeFileSync(
    FRONTEND_CONFIG_PATH,
    `const config = ${JSON.stringify(
      config,
      null,
      2
    )} as const;\nexport default config;`,
    "utf8"
  )

  console.log("Frontend config updated successfully!")
}

// Main execution
async function main() {
  const deployedContracts = deployContracts()
  await updateFrontendConfig(deployedContracts)
}

main().catch((error) => {
  console.error("Error in deployment process:", error)
  process.exit(1)
})
