const http = require("http");
const { execSync } = require("child_process");
const path = require("path");

function checkRpc(url) {
  return new Promise((resolve) => {
    const req = http.request(
      "http://127.0.0.1:8545",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve(res.statusCode === 200);
        });
      }
    );

    req.on("error", () => {
      resolve(false);
    });

    req.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      })
    );
    req.end();
  });
}

async function main() {
  console.log("Waiting for Hardhat node to be ready on http://127.0.0.1:8545...");
  let isReady = false;
  for (let i = 0; i < 30; i++) {
    isReady = await checkRpc("http://127.0.0.1:8545");
    if (isReady) {
      console.log(" Hardhat node is ready!");
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!isReady) {
    console.error("❌ Hardhat node did not respond in 30 seconds.");
    process.exit(1);
  }

  console.log("Deploying smart contracts...");
  execSync("npx hardhat run scripts/deploy.js --network localhost", {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });

  console.log("Generating sample demo PDF files...");
  execSync("node scripts/generate-demo-pdf.js", {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });

  console.log(" Ready to start Backend and Frontend!");
}

main().catch(console.error);
