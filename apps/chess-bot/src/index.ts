import  { spawn } from 'child_process';

// Command to run Python script

const pythonProcess = spawn('python3', ['server.py']);

// Log stdout data from the Python process
pythonProcess.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// Log stderr data from the Python process
pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// Log when the Python process exits
pythonProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});