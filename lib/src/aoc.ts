
const ENV_VAR = 'AOC_SESSION';

export function requireSessionFromEnv() {
  if (!(ENV_VAR in process.env)) {
    throw new Error(`Please set your AoC token when running a solution: ${ENV_VAR}=TOKEN-HERE ${process.argv.join(' ')}`);
  }

  return process.env[ENV_VAR];
}
