import { exec, ExecException } from 'child_process';

export const command = (
  command: string,
): Promise<{ err?: ExecException; stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject({ err, stdout, stderr });
      }
      resolve({ err: undefined, stdout, stderr });
    });
  });
};
