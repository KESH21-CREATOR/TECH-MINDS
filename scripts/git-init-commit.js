const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const path = require("path");

const repoDir = path.join(__dirname, "..");

const IGNORE_PATTERNS = [
  ".git",
  "node_modules",
  "artifacts",
  "cache",
  "typechain",
  "typechain-types",
  "dist",
  ".env",
  ".tmp",
  "hardhat.log",
  "backend.log",
  "frontend.log"
];

function shouldIgnore(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  return IGNORE_PATTERNS.some((p) => {
    return (
      normalized === p ||
      normalized.startsWith(p + "/") ||
      normalized.includes("/" + p + "/") ||
      normalized.endsWith("/" + p)
    );
  });
}

function getAllFiles(dir, baseDir = dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

    if (shouldIgnore(relPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(relPath);
    }
  }

  return files;
}

async function main() {
  console.log("==================================================");
  console.log("    Initializing Git Repository & Staging Files   ");
  console.log("==================================================");

  // 1. Git Init
  console.log("1. Initializing Git repository in:", repoDir);
  await git.init({ fs, dir: repoDir, defaultBranch: "main" });

  // 2. Scan Files
  const allFiles = getAllFiles(repoDir);
  console.log(`2. Found ${allFiles.length} project files to stage (excluding node_modules & build artifacts).`);

  // 3. Git Add
  console.log("3. Staging files into Git index...");
  for (const file of allFiles) {
    await git.add({ fs, dir: repoDir, filepath: file });
  }

  // 4. Git Commit
  console.log("4. Committing project files to main branch...");
  const sha = await git.commit({
    fs,
    dir: repoDir,
    message: "feat: Complete CredentialChain Platform - Instant Transcript & Migration Verification System",
    author: {
      name: "KESH21-CREATOR",
      email: "creator@credentialchain.org",
      timestamp: Math.floor(Date.now() / 1000)
    }
  });

  console.log(" Commit created with SHA:", sha);

  // 5. Add remote origin
  console.log("5. Configuring remote origin: https://github.com/KESH21-CREATOR/TECH-MINDS.git");
  try {
    await git.deleteRemote({ fs, dir: repoDir, remote: "origin" });
  } catch (e) {}

  await git.addRemote({
    fs,
    dir: repoDir,
    remote: "origin",
    url: "https://github.com/KESH21-CREATOR/TECH-MINDS.git"
  });

  console.log("\n Git repository successfully initialized, staged, committed, and linked to origin!");
}

main().catch(console.error);
