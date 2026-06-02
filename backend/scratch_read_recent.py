import json

transcript_path = r"C:\Users\santi\.gemini\antigravity\brain\b3b4678b-ee99-46fd-9e70-80300f1f0da1\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx >= 6200 and step_idx <= 6300:
                print(f"Step {step_idx}: Type={data.get('type')}, Source={data.get('source')}")
                if "content" in data and len(data["content"]) < 1500:
                    print("Content:", data["content"])
                if "thinking" in data:
                    print("Thinking:", data["thinking"])
                print("=" * 60)
        except Exception as e:
            pass
