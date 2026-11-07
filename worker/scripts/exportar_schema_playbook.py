"""Gera contracts/playbook.schema.json (C4) a partir do modelo Pydantic. Rode: uv run python scripts/exportar_schema_playbook.py"""

import json
from pathlib import Path

from ia.playbook import CATALOGO_ACOES, Playbook

destino = Path(__file__).resolve().parents[2] / "contracts" / "playbook.schema.json"
schema = Playbook.model_json_schema()
schema["$comment"] = "Gerado por worker/scripts/exportar_schema_playbook.py. Ações válidas: " + ", ".join(sorted(CATALOGO_ACOES))
destino.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"escrito {destino}")
