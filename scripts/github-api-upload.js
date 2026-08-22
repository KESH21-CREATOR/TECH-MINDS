const fs = require("fs");
const path = require("path");

const repoDir = path.join(__dirname, "..");
const OWNER = "KESH21-CREATOR";
const REPO = "TECH-MINDS";
const BRANCH = "main";
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

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
      files.push({ fullPath, relPath });
    }
  }

  return files;
}

async function githubRequest(endpoint, method = "GET", body = null, retries = 3) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${TOKEN}`,
    "User-Agent": "CredentialChain-Uploader",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (attempt < retries && (res.status >= 500 || res.status === 400 || res.status === 403)) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`GitHub API [${res.status}] ${endpoint}: ${data.message || JSON.stringify(data)}`);
      }

      return data;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  if (!TOKEN) {
    console.error("Please provide GitHub token as first argument");
    process.exit(1);
  }

  console.log("==================================================");
  console.log("     Direct GitHub Git Data API File Uploader     ");
  console.log("==================================================");
  console.log(` Target Repo: https://github.com/${OWNER}/${REPO}`);
  console.log(` Target Branch: ${BRANCH}`);
  console.log("--------------------------------------------------");

  // 1. Verify Repository Access
  console.log("1. Verifying repository access...");
  const repoInfo = await githubRequest(`/repos/${OWNER}/${REPO}`);
  console.log(` Connected to repository: ${repoInfo.full_name} (${repoInfo.private ? "Private" : "Public"})`);

  // 2. Collect all files
  const fileEntries = getAllFiles(repoDir);
  console.log(`2. Found ${fileEntries.length} project files to upload.`);

  // 3. Upload Blobs
  console.log("3. Creating Git Blobs on GitHub for all files...");
  const treeItems = [];

  for (let i = 0; i < fileEntries.length; i++) {
    const { fullPath, relPath } = fileEntries[i];
    const fileBuffer = fs.readFileSync(fullPath);
    const isBinary = relPath.endsWith(".pdf") || relPath.endsWith(".png") || relPath.endsWith(".ico");

    let blobData;
    if (isBinary) {
      blobData = await githubRequest(`/repos/${OWNER}/${REPO}/git/blobs`, "POST", {
        content: fileBuffer.toString("base64"),
        encoding: "base64"
      });
    } else {
      blobData = await githubRequest(`/repos/${OWNER}/${REPO}/git/blobs`, "POST", {
        content: fileBuffer.toString("utf8"),
        encoding: "utf-8"
      });
    }

    treeItems.push({
      path: relPath,
      mode: "100644",
      type: "blob",
      sha: blobData.sha
    });

    if ((i + 1) % 15 === 0 || i === fileEntries.length - 1) {
      console.log(`   Uploaded ${i + 1}/${fileEntries.length} files...`);
    }
  }

  // 4. Create Git Tree
  console.log("4. Creating Git Tree structure...");
  const treeData = await githubRequest(`/repos/${OWNER}/${REPO}/git/trees`, "POST", {
    tree: treeItems
  });
  console.log(` Git Tree created (SHA: ${treeData.sha})`);

  // 5. Get Parent Commit if exists
  let parentCommitSha = null;
  try {
    const refData = await githubRequest(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    parentCommitSha = refData.object.sha;
  } catch (e) {
    // If branch doesn't exist yet, try master or default branch
    try {
      const defaultRef = await githubRequest(`/repos/${OWNER}/${REPO}/git/ref/heads/${repoInfo.default_branch}`);
      parentCommitSha = defaultRef.object.sha;
    } catch (e2) {}
  }

  // 6. Create Git Commit
  console.log("5. Creating Commit...");
  const commitPayload = {
    message: "feat: Complete CredentialChain Platform - Instant Transcript & Migration Verification System",
    tree: treeData.sha,
    author: {
      name: "KESH21-CREATOR",
      email: "creator@credentialchain.org",
      date: new Date().toISOString()
    }
  };

  if (parentCommitSha) {
    commitPayload.parents = [parentCommitSha];
  }

  const commitData = await githubRequest(`/repos/${OWNER}/${REPO}/git/commits`, "POST", commitPayload);
  console.log(` Commit created (SHA: ${commitData.sha})`);

  // 7. Update or Create Branch Ref
  console.log(`6. Updating branch '${BRANCH}' on GitHub...`);
  try {
    await githubRequest(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, "PATCH", {
      sha: commitData.sha,
      force: true
    });
  } catch (e) {
    // If ref doesn't exist, create it
    await githubRequest(`/repos/${OWNER}/${REPO}/git/refs`, "POST", {
      ref: `refs/heads/${BRANCH}`,
      sha: commitData.sha
    });
  }

  // Set default branch to main if needed
  try {
    await githubRequest(`/repos/${OWNER}/${REPO}`, "PATCH", {
      default_branch: BRANCH
    });
  } catch (e) {}

  console.log("\n==================================================");
  console.log(" 🎉 SUCCESS! ALL PROJECT CODES UPLOADED TO GITHUB!");
  console.log(` 🌐 Repository URL: https://github.com/${OWNER}/${REPO}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("\n❌ Upload Error:", err.message);
  process.exit(1);
});
