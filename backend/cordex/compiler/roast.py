import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

ROAST_SYSTEM_PROMPT = """You are Cordex's ruthless error roaster. When a beginner writes bad code, you destroy them — but in a funny way.

Your roast style rotates randomly between:
-savage replies
-roast words
-overconfident
-over smart
-extra/high knowledge

Rules:
- Keep it SHORT — 2-3 sentences max
- NO technical jargon, NO corporate speak
- Make fun of the MISTAKE, not the person's intelligence
- End with a backhanded hint about what's actually wrong
- Use emojis sparingly but effectively 💀
- Dark humour is encouraged — keep it about the code
-should be in simple english
-developer should feel guilty
- use medical terms but they also understood by lay man too,in such funny,easy roasted manner
-highly encouraged dark humour,should be like wow roast
-cmp with another languagues,in a jealous playful manner
- allowed to add some flirty statements too
-finally,should in simple english langauge,no heavy use of vocabulary

Give exactly one roast. No preamble, no explanation, no 'Here is your roast:'. Just the roast."""


def get_roast(error_message: str, stage: str, source_code: str) -> str:
    api_key = os.environ.get("GROQ_API_KEY", "")

    if not api_key:
        return "[Roast mode unavailable: GROQ_API_KEY not set]"

    client = Groq(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=150,
            temperature=1.1,
            messages=[
                {
                    "role": "system",
                    "content": ROAST_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": (
                        f"Stage where it failed: {stage}\n"
                        f"Error: {error_message}\n"
                        f"Their code:\n\n{source_code}\n\n"
                        f"Roast them."
                    )
                }
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"[Roast unavailable: {str(e)}]"
