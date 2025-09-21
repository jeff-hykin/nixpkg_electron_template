#!/usr/bin/env node -e 
const { spawn } = require('child_process');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Example usage
(async () => {
  try {
    const output = await runCommand('npx', ['electron', "--version"]); // Use 'dir' on Windows
    console.warn(`output is:`,output)
    console.log(output.replace(/[^0-9\.]/g, ''));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
