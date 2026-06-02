import json

transcript_path = r"C:\Users\santi\.gemini\antigravity\brain\b3b4678b-ee99-46fd-9e70-80300f1f0da1\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx >= 6160 and step_idx <= 6300:
                if data.get("source") == "MODEL" and data.get("type") == "PLANNER_RESPONSE":
                    print(f"Step {step_idx}:")
                    print(data.get("thinking"))
                    print("-" * 50)
        except Exception as e:
            pass
