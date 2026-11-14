import os
from pathlib import Path
from typing import Dict, List, Optional
import httpx


def load_env(env_path: Path) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not env_path.exists():
        return env
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("'\"")
    return env


def test_provider(
    name: str,
    api_key: str,
    configured_model: str,
    models_url: str,
    completion_url: str,
    headers: Dict[str, str],
    is_gemini: bool = False,
):
    print(f"\n[{name.upper()}]")
    print(f"  Configured Model ID: {configured_model}")

    # 1. List Models Endpoint
    available_models: List[str] = []
    model_found = False
    list_status = "ERR"

    try:
        url = f"{models_url}?key={api_key}" if is_gemini and "openai" not in models_url else models_url
        with httpx.Client(timeout=15.0) as client:
            r = client.get(url, headers=headers)
            list_status = str(r.status_code)
            if r.status_code == 200:
                data = r.json()
                if "data" in data and isinstance(data["data"], list):
                    available_models = [m["id"] for m in data["data"] if "id" in m]
                elif "models" in data and isinstance(data["models"], list):
                    available_models = [m.get("name", "").replace("models/", "") for m in data["models"]]

                # Match configured model
                norm_config = configured_model.lower().replace("models/", "")
                for m in available_models:
                    if m.lower().replace("models/", "") == norm_config:
                        model_found = True
                        break
            elif r.status_code == 401:
                print(f"  [FAIL] List Models: HTTP 401 (Invalid API Key)")
                return
            elif r.status_code == 429:
                print(f"  [FAIL] List Models: HTTP 429 (Quota / Rate Limited)")
                return
            else:
                print(f"  [WARN] List Models: HTTP {r.status_code}")
    except Exception as e:
        print(f"  [FAIL] List Models Network Error: {type(e).__name__}")

    if available_models:
        if model_found:
            print(f"  [PASS] List Models: Found configured model in {len(available_models)} available models.")
        else:
            print(f"  [FAIL] List Models: Model '{configured_model}' NOT found in provider model list!")
            sample = [m for m in available_models if "chat" in m.lower() or "flash" in m.lower() or "free" in m.lower() or "8b" in m.lower() or "qwen" in m.lower()][:5]
            print(f"         Suggested current models: {sample}")
    else:
        print(f"  [INFO] List Models returned status {list_status}")

    # 2. Tiny Test Completion
    payload = {
        "model": configured_model,
        "messages": [{"role": "user", "content": "Respond with 'OK'"}],
        "max_tokens": 5,
        "temperature": 0.0,
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            r = client.post(completion_url, headers=headers, json=payload)
            if r.status_code == 200:
                print(f"  [PASS] Completion: HTTP 200 OK")
            elif r.status_code == 401:
                print(f"  [FAIL] Completion: HTTP 401 (Invalid API Key)")
            elif r.status_code == 404:
                print(f"  [FAIL] Completion: HTTP 404 (Model ID Not Found by Provider)")
            elif r.status_code == 429:
                print(f"  [FAIL] Completion: HTTP 429 (Quota Exceeded / Rate Limit)")
            else:
                body_peek = r.text[:120].replace("\n", " ")
                print(f"  [FAIL] Completion: HTTP {r.status_code} ({body_peek})")
    except httpx.TimeoutException:
        print("  [FAIL] Completion: Request timed out (>20s)")
    except Exception as e:
        print(f"  [FAIL] Completion Network Error: {type(e).__name__}")


def main():
    # Check paths
    candidates = [
        Path("C:/Users/MAYSAMALI MASU/Documents/GitHub/Samvidhan_Law/backend/.env"),
        Path("backend/.env"),
        Path("../backend/.env"),
    ]
    env_file = next((p for p in candidates if p.exists()), None)
    if not env_file:
        print("ERROR: backend/.env not found.")
        return

    env = load_env(env_file)
    print("=" * 75)
    print(f"SAMVIDHAN AI PROVIDER DIAGNOSTIC (Reading {env_file.name})")
    print("=" * 75)

    order_raw = env.get("AI_PROVIDER_ORDER", "groq,gemini,openrouter")
    providers = [p.strip().lower() for p in order_raw.split(",") if p.strip()]
    print(f"Configured Provider Order: {', '.join(providers)}")

    for prov in providers:
        key = env.get(f"{prov.upper()}_API_KEY", "")
        model = env.get(f"{prov.upper()}_MODEL", "")

        if not key:
            print(f"\n[{prov.upper()}] SKIPPED: Key is empty or unset in .env")
            continue

        if prov == "gemini":
            test_provider(
                name="gemini",
                api_key=key,
                configured_model=model or "gemini-1.5-flash",
                models_url="https://generativelanguage.googleapis.com/v1beta/openai/models",
                completion_url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                is_gemini=True,
            )
        elif prov == "groq":
            test_provider(
                name="groq",
                api_key=key,
                configured_model=model or "llama-3.1-8b-instant",
                models_url="https://api.groq.com/openai/v1/models",
                completion_url="https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
        elif prov == "openrouter":
            test_provider(
                name="openrouter",
                api_key=key,
                configured_model=model or "meta-llama/llama-3.2-3b-instruct:free",
                models_url="https://openrouter.ai/api/v1/models",
                completion_url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://samvidhan.law",
                    "X-Title": "Samvidhan",
                },
            )
        elif prov == "mistral":
            test_provider(
                name="mistral",
                api_key=key,
                configured_model=model or "mistral-small-latest",
                models_url="https://api.mistral.ai/v1/models",
                completion_url="https://api.mistral.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
        else:
            print(f"\n[{prov.upper()}] Unknown provider name.")

    print("\n" + "=" * 75)


if __name__ == "__main__":
    main()
