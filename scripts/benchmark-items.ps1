param([Parameter(Mandatory=$true)][ValidateSet('before','after')][string]$Phase)
$ErrorActionPreference = 'Stop'
function Invoke-ItemsCompose {
    $DockerArgs = $args
    & docker compose -f docker-compose.yml -f compose.benchmark.yml @DockerArgs
    if ($LASTEXITCODE -ne 0) { throw "Docker falhou: $DockerArgs" }
}
$env:CATALOG_CACHE_ENABLED = 'false'
try {
    Invoke-ItemsCompose up --build -d --wait
    Invoke-ItemsCompose exec -T app npx tsx scripts/reset-benchmark.ts
    Invoke-ItemsCompose exec -T app npm run seed
    Invoke-ItemsCompose exec -T app npm run verify:seed
    $revision = git rev-parse HEAD
    $sourceHash = (Get-FileHash src/modules/orders/repository.ts -Algorithm SHA256).Hash
    $image = docker inspect forma-benchmark-app-1 --format '{{.Image}}'
    @{ revision=$revision; repositorySha256=$sourceHash; image=$image; timestamp=(Get-Date).ToUniversalTime().ToString('o'); cache=$false; initialOrders=100000; initialItems=100000; stages='10s ramp / 30s hold / 10s down'; maxVUs=10; warmup='no dedicated warmup; ramp included'; basket='four distinct catalog products, quantity one' } | ConvertTo-Json | Set-Content "docs/evidencias/items-$Phase-run.json"
    Invoke-ItemsCompose exec -T postgres psql -U forma -d forma_benchmark -c 'SELECT (SELECT count(*) FROM orders.orders) orders,(SELECT count(*) FROM orders.items) items' | Set-Content "docs/evidencias/items-$Phase-seed.txt"
    $ErrorActionPreference = 'Continue' # Windows PowerShell represents Docker stderr as ErrorRecord.
    & docker compose -f docker-compose.yml -f compose.benchmark.yml run --rm k6 run "--summary-export=/results/items-$Phase-summary.json" --out "json=/results/items-$Phase-raw.json" /scripts/order-items.js *> "docs/evidencias/items-$Phase-console.txt"
    $benchmarkExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($benchmarkExit -ne 0) { throw "k6 falhou: $benchmarkExit" }
} finally { Remove-Item Env:CATALOG_CACHE_ENABLED -ErrorAction SilentlyContinue }
