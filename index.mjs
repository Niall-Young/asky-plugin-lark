import { createHash } from 'node:crypto';
const domains = new Set('approval attendance base calendar contact docs drive im mail markdown mindnotes minutes note okr sheets slides task vc whiteboard wiki'.split(' '));
const fail = message => { throw new Error(message); };
function validate(argv) {
  if (!Array.isArray(argv) || !argv.length || argv.length > 128 || argv.some(x => typeof x !== 'string' || !x.length || x.includes('\0'))) fail('argv must be a nonempty array of strings.');
  if (argv.some(x => /^(--as|--format|--jq|--profile|--help|--json)(=|$)/.test(x) || ['-h', '-q'].includes(x))) fail('Identity/output/profile/help flags are controlled by the plugin.');
  return [...argv];
}
function command(argv) {
  const size = argv[1]?.startsWith('+') ? 2 : 3;
  const path = argv.slice(0, size);
  if (!domains.has(path[0]) || path.length !== size || path.some(x => !/^[a-z][a-z0-9_.-]*$|^\+[a-z][a-z0-9_-]*$/.test(x))) fail('Use a supported business-domain shortcut or typed API command; raw api and CLI management are not supported.');
  return path;
}
async function run(ctx, argv, seconds = 120) {
  const result = await ctx.exec(ctx.configuration.cli_path || 'lark-cli', argv, {timeoutSeconds: seconds});
  let data;
  try { data = JSON.parse(result.stdout || result.stderr); } catch { data = {text: result.stdout || result.stderr}; }
  if (result.exitCode !== 0 || data.ok === false) {
    if (result.exitCode === 10) return {ok: false, confirmationRequired: true, error: data.error, instruction: 'Show action, risk and parameters to the user. Retry with the indicated flag only after explicit approval; never retry automatically.'};
    fail(JSON.stringify(data.error ?? data));
  }
  return data;
}
async function risk(ctx, path) {
  const result = await ctx.exec(ctx.configuration.cli_path || 'lark-cli', [...path, '--help'], {timeoutSeconds: 20});
  const match = result.stdout.match(/^Risk:\s*(read|write|high-risk-write)\s*$/m);
  if (result.exitCode !== 0 || !match) fail('Cannot determine CLI risk; inspect help and do not execute.');
  return match[1];
}
function identity(ctx) {
  const value = ctx.configuration.identity || 'user';
  if (!['user', 'bot'].includes(value)) fail('Identity must be user or bot.');
  return value;
}
async function query(args, ctx) {
  const argv = validate(args.argv);
  if (argv[0] === 'whoami' && argv.length === 1) return run(ctx, argv);
  if (argv[0] === 'auth' && argv[1] === 'status' && argv.slice(2).every(x => x === '--verify')) return run(ctx, [...argv, '--json']);
  if (argv[0] === 'schema' && argv.length === 2 && /^[a-z][a-z0-9_.-]+$/.test(argv[1])) return run(ctx, argv);
  if (argv[0] === 'skills' && ['list','read'].includes(argv[1]) && argv.slice(2).every(x => /^[a-zA-Z0-9_./-]+$/.test(x) && !x.startsWith('-') && !x.includes('..'))) return run(ctx, [...argv, '--json']);
  const path = command(argv);
  if (await risk(ctx, path) !== 'read') fail('Write commands must use execute and require confirmation.');
  if (argv.some(x => /^(--output|--output-dir|--file|--save|--download)(=|$)/.test(x))) fail('Commands with local file effects must use the confirmed execute tool.');
  return run(ctx, [...argv, '--as', identity(ctx), '--format', 'json']);
}
async function execute(args, ctx) {
  const argv = validate(args.argv), path = command(argv);
  await risk(ctx, path);
  const id = ctx.requestID;
  if (!id) fail('A stable requestID is required for writes.');
  const state = ctx.state ?? {};
  state.attempts ??= {};
  const fingerprint = createHash('sha256').update(JSON.stringify([argv, identity(ctx)])).digest('hex');
  if (state.attempts[id]) {
    if (state.attempts[id] !== fingerprint) fail('Request ID was reused with different arguments.');
    return {status:'already_attempted', instruction:'Do not replay this write. Query the target to establish the result.'};
  }
  // Persist before the external effect. A crash between this checkpoint and execution
  // deliberately prefers a possibly missed operation to an accidental duplicate.
  state.attempts[id] = fingerprint;
  await ctx.saveState(state);
  return run(ctx, [...argv, '--as', identity(ctx), '--format', 'json']);
}
export default {tools: {
  help: {async execute(args, ctx) {
    const argv = args.argv;
    if (!Array.isArray(argv) || argv.length > 3 || argv.some(x => typeof x !== 'string' || !/^[a-z][a-z0-9_.-]*$|^\+[a-z][a-z0-9_-]*$/.test(x))) fail('Help accepts only a command path, without flags.');
    return run(ctx, [...argv, '--help'], 20);
  }},
  query: {execute: query},
  execute: {execute, async readback() { return null; }}
}};
