import json

transcript_path = r"C:\Users\santi\.gemini\antigravity\brain\b3b4678b-ee99-46fd-9e70-80300f1f0da1\.system_generated\logs\transcript.jsonl"

target_steps = [6169, 6170, 6171, 6200, 6201, 6202, 6216, 6020, 6021]

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx in target_steps or (step_idx >= 6160 and step_idx <= 6175):
                print(f"Step {step_idx}: Type={data.get('type')}, Source={data.get('source')}, Status={data.get('status')}")
                if "tool_calls" in data:
                    print("Tool calls:", data["tool_calls"])
                if "content" in data and len(data["content"]) < 1000:
                    print("Content:", data["content"])
                print("Keys present:", list(data.keys()))
                print("=" * 60)
        except Exception as e:
            pass
