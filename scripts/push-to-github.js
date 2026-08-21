const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");

const repoDir = path.join(__dirname, "..");
const token = process.argv[2] || process.env.GITHUB_TOKEN;

async function push() {
  console.log("==================================================");
  console.log("      Pushing CredentialChain to GitHub Repo      ");
  console.log("==================================================");
  console.log(" Repository URL : https://github.com/KESH21-CREATOR/TECH-MINDS.git");
  console.log(" Target Branch  : main");
  console.log("--------------------------------------------------");

  if (!token) {
    console.log("\n⚠️  A GitHub Personal Access Token (PAT) is required to push.");
    console.log("\nHow to generate your token in 30 seconds:");
    console.log("1. Go to: https://github.com/settings/tokens?type=beta (or classic: https://github.com/settings/tokens/new)");
    console.log("2. Click 'Generate new token'");
    console.log("3. Give it a name (e.g. 'Hackathon Upload') and check the 'repo' scope checkbox.");
    console.log("4. Copy the generated token (starts with ghp_ or github_pat_).");
    console.log("\nThen run this command:");
    console.log("   node scripts/push-to-github.js <YOUR_GITHUB_TOKEN>");
    console.log("\nExample:");
    console.log("   node scripts/push-to-github.js ghp_xxxxxxxxxxxxxxxxxxxx");
    console.log("==================================================\n");
    process.exit(1);
  }

  console.log("Authenticating and pushing commits to GitHub...");

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir: repoDir,
      remote: "origin",
      ref: "main",
      force: true,
      onAuth: () => ({
        username: token,
        password: ""
      })
    });

    console.log("\n SUCCESS! All files and code pushed to GitHub repository!");
    console.log(" View your repository at: https://github.com/KESH21-CREATOR/TECH-MINDS");
    console.log("==================================================\n");
  } catch (err) {
    console.error("\n❌ Push Failed:", err.message);
    if (err.message.includes("HTTP 401") || err.message.includes("Authentication failed")) {
      console.error("Please verify that your GitHub token is valid and has 'repo' (write) permissions.");
    }
    process.exit(1);
  }
}

push().catch(console.error);
