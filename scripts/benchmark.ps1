$ErrorActionPreference = 'Stop'
function Invoke-BenchmarkCompose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$DockerArgs)
    & docker compose -f docker-compose.yml -f compose.benchmark.yml @DockerArgs
    if ($LASTEXITCODE -ne 0) { throw "Docker falhou: $DockerArgs" }
}
Invoke-BenchmarkCompose up --build -d --wait
$benchmarkRevision = git rev-parse HEAD
$benchmarkDirty = git status --porcelain
$benchmarkImage = docker inspect forma-benchmark-app-1 --format '{{.Image}}'
@{ revision=$benchmarkRevision; dirty=@($benchmarkDirty); image=$benchmarkImage; timestamp=(Get-Date).ToUniversalTime().ToString('o'); stages='10s ramp / 30s hold / 10s down'; maxVUs=10; warmup='no dedicated warmup; ramp included' } | ConvertTo-Json | Set-Content docs/evidencias/benchmark-run.json
foreach ($phase in @('before','after')) {
    Invoke-BenchmarkCompose exec -T app npx tsx scripts/reset-benchmark.ts
    Invoke-BenchmarkCompose exec -T app npm run seed
    Invoke-BenchmarkCompose exec -T app npm run verify:seed
    Invoke-BenchmarkCompose exec -T redis redis-cli FLUSHDB
    $env:CATALOG_CACHE_ENABLED = if ($phase -eq 'before') { 'false' } else { 'true' }
    Invoke-BenchmarkCompose up -d --wait --no-deps app
    Invoke-BenchmarkCompose exec -T postgres psql -U forma -d forma_benchmark -c 'SELECT (SELECT count(*) FROM orders.orders) orders,(SELECT count(*) FROM orders.items) items' | Set-Content "docs/evidencias/controlled-$phase-seed.txt"
    Invoke-BenchmarkCompose run --rm k6 run "--summary-export=/results/controlled-$phase-summary.json" --out "json=/results/controlled-$phase-raw.json" /scripts/scenario.js *> "docs/evidencias/controlled-$phase-console.txt"
}
Remove-Item Env:CATALOG_CACHE_ENABLED
node scripts/compress-evidence.mjs
