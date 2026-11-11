import { readFileSync } from "node:fs";
import YAML from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
const schema = JSON.parse(
  readFileSync(".verification/render-schema.json", "utf8"),
);
const ajv = new Ajv2020.default({
  strict: false,
  allErrors: true,
});
addFormats.default(ajv);
const validate = ajv.compile(schema);
if (!validate(YAML.parse(readFileSync("render.yaml", "utf8")))) {
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exitCode = 1;
} else
  console.log(
    "render.yaml válido segundo o schema oficial Render obtido nesta sessão.",
  );
